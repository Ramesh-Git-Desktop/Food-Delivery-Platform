// controllers/user.controller.js
const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Review");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const { sendEmail } = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

const ALLOWED_ADDRESS_TYPES = ["home", "work", "other"];
const resolveAddressType = (body) =>
  body.addressType || body.level || body.label || body.type || "home";

const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const normalized = String(value).replace(/"/g, "\"\"");
  return `"${normalized}"`;
};

const toCsv = (rows, columns) => {
  const header = columns.map((column) => csvEscape(column)).join(",");
  const lines = rows.map((row) =>
    columns.map((column) => csvEscape(row[column])).join(",")
  );
  return [header, ...lines].join("\n");
};

const buildExportPayload = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const [orders, reviews] = await Promise.all([
    Order.find({ user: userId })
      .populate("restaurant", "name")
      .populate("rider", "name")
      .sort({ createdAt: -1 })
      .lean(),
    Review.find({ user: userId })
      .populate("restaurant", "name")
      .populate("rider", "name")
      .populate("order", "orderNumber")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    user,
    addresses: Array.isArray(user.addresses) ? user.addresses : [],
    orders,
    reviews,
    exportedAt: new Date().toISOString(),
  };
};

const buildCsvRows = (payload) => {
  const rows = [];
  const { user, addresses, orders, reviews, exportedAt } = payload;

  rows.push({
    recordType: "profile",
    exportedAt,
    userId: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
  });

  for (const address of addresses) {
    rows.push({
      recordType: "address",
      exportedAt,
      userId: user._id,
      addressLabel: address.label,
      addressName: address.name,
      addressPhone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
    });
  }

  for (const order of orders) {
    rows.push({
      recordType: "order",
      exportedAt,
      userId: user._id,
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      restaurantName: order.restaurant?.name || "",
      riderName: order.rider?.name || "",
      itemsCount: Array.isArray(order.items) ? order.items.length : 0,
      itemsTotal: order.pricing?.itemsTotal ?? "",
      deliveryFee: order.pricing?.deliveryFee ?? "",
      tax: order.pricing?.tax ?? "",
      discount: order.pricing?.discount ?? "",
      grandTotal: order.pricing?.grandTotal ?? "",
      orderCreatedAt: order.createdAt,
    });
  }

  for (const review of reviews) {
    rows.push({
      recordType: "review",
      exportedAt,
      userId: user._id,
      reviewId: review._id,
      reviewType: review.type,
      rating: review.rating,
      reviewText: review.review,
      reviewTargetName: review.type === "restaurant" ? review.restaurant?.name || "" : review.rider?.name || "",
      reviewOrderNumber: review.order?.orderNumber || "",
      reviewCreatedAt: review.createdAt,
    });
  }

  return rows;
};

const writePdfExport = (res, payload) => {
  const { user, addresses, orders, reviews, exportedAt } = payload;
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  const fileName = `gdpr-export-${user._id}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  doc.pipe(res);

  doc.fontSize(18).text("User Data Export (GDPR)", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Generated At: ${exportedAt}`);
  doc.text(`User ID: ${user._id}`);
  doc.moveDown();

  doc.fontSize(13).text("Profile");
  doc.fontSize(10).text(`Name: ${user.name || ""}`);
  doc.text(`Email: ${user.email || ""}`);
  doc.text(`Phone: ${user.phone || ""}`);
  doc.text(`Verified: ${user.isVerified ? "Yes" : "No"}`);
  doc.text(`Blocked: ${user.isBlocked ? "Yes" : "No"}`);

  doc.moveDown();
  doc.fontSize(13).text(`Addresses (${addresses.length})`);
  doc.fontSize(10);
  addresses.forEach((address, index) => {
    doc.text(
      `${index + 1}. ${address.label || ""} - ${address.name || ""}, ${address.street || ""}, ${address.city || ""}, ${address.state || ""} ${address.zipCode || ""}, ${address.country || ""}`
    );
  });

  doc.moveDown();
  doc.fontSize(13).text(`Orders (${orders.length})`);
  doc.fontSize(10);
  orders.forEach((order, index) => {
    doc.text(
      `${index + 1}. ${order.orderNumber || order._id} | ${order.status} | ${order.paymentMethod} | Total: ${order.pricing?.grandTotal ?? "N/A"} | Date: ${order.createdAt}`
    );
  });

  doc.moveDown();
  doc.fontSize(13).text(`Reviews (${reviews.length})`);
  doc.fontSize(10);
  reviews.forEach((review, index) => {
    const targetName = review.type === "restaurant" ? review.restaurant?.name || "" : review.rider?.name || "";
    doc.text(
      `${index + 1}. ${review.type} | Rating: ${review.rating} | Target: ${targetName} | ${review.review || ""}`
    );
  });

  doc.end();
};

async function exportUserData(req, res, next) {
  try {
    const format = String(req.query.format || "csv").toLowerCase();
    if (!["csv", "pdf"].includes(format)) {
      return next(new ApiError(400, "Invalid format. Use csv or pdf"));
    }

    const payload = await buildExportPayload(req.user._id);

    if (format === "pdf") {
      return writePdfExport(res, payload);
    }

    const columns = [
      "recordType",
      "exportedAt",
      "userId",
      "name",
      "email",
      "phone",
      "isVerified",
      "isBlocked",
      "addressLabel",
      "addressName",
      "addressPhone",
      "street",
      "city",
      "state",
      "zipCode",
      "country",
      "isDefault",
      "orderId",
      "orderNumber",
      "orderStatus",
      "paymentMethod",
      "paymentStatus",
      "restaurantName",
      "riderName",
      "itemsCount",
      "itemsTotal",
      "deliveryFee",
      "tax",
      "discount",
      "grandTotal",
      "orderCreatedAt",
      "reviewId",
      "reviewType",
      "rating",
      "reviewText",
      "reviewTargetName",
      "reviewOrderNumber",
      "reviewCreatedAt",
    ];

    const csvRows = buildCsvRows(payload);
    const csvData = toCsv(csvRows, columns);
    const fileName = `gdpr-export-${payload.user._id}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(csvData);
  } catch (error) {
    logger.error("User data export failed", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    return next(error);
  }
}


async function registerUser(req, res, next) {
  try {

    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return next(new ApiError(409, "Email already exists"));
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: "user",
    });
    const otp = user.generateEmailVerificationOTP();

    await user.save();

    // Send OTP email
    await sendEmail(
      user.email,
      "Email Verification OTP",
      `Your OTP is ${otp}. It expires in 10 minutes.`
    );

    // Generate temporary token
    const tempToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      tempToken
    });

  } catch (error) {
    next(error);
  }
}


async function resendVerificationOTP(req, res) {
  try {

    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        message: "tempToken is required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired tempToken",
      });
    }

    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    const otp = user.generateEmailVerificationOTP();

    await user.save();

    await sendEmail(
      user.email,
      "Resend Email Verification OTP",
      `Your new OTP is ${otp}. It expires in 10 minutes.`
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    logger.error("Resend Verification OTP Error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    res.status(500).json({
      message: "Server error",
    });
  }
}



// ================= VERIFY EMAIL =================
async function verifyEmail(req, res) {

  try {

    const { otp, tempToken } = req.body;

    if (!otp || !tempToken) {
      return res.status(400).json({
        success: false,
        message: "OTP and tempToken are required",
      });
    }

    // Decode token safely
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired tempToken",
      });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.findOne({
      _id: decoded.id,
      emailVerificationToken: hashedOTP,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;

    user.clearVerificationFields();

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}



// ================= LOGIN USER =================
async function loginUser(req, res) {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked. Please contact support or wait until it is unblocked.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    generateToken(user, res);

    res.json({
      message: "Login successful",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}



// ================= LOGOUT =================
async function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
}

// ================= GET PROFILE =================
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addresses = user.addresses;

    return res.status(200).json({
      ...user.toObject(),
      addresses
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ================= ADDRESS BOOK =================
async function getAddresses(req, res) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addresses = user.addresses.sort((a, b) => {
      if (a.isDefault === b.isDefault) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return b.isDefault - a.isDefault;
    });

    return res.status(200).json({ success: true, addresses });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function addAddress(req, res) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const street = req.body.addressLine1 || req.body.address || req.body.street;
    const city = req.body.city || req.body.town;
    const state = req.body.state;
    const zipCode = req.body.pincode || req.body.pinCode || req.body.zipCode;
    const label = String(resolveAddressType(req.body)).toLowerCase();
    const country = req.body.country || "India";
    const name = req.body.fullName || req.body.name;
    const { isDefault } = req.body;

    if (!street || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        message: "address, city, state, zipCode are required"
      });
    }

    if (!name || !req.body.phone) {
      return res.status(400).json({
        success: false,
        message: "name and phone are required"
      });
    }

    if (!ALLOWED_ADDRESS_TYPES.includes(label)) {
      return res.status(400).json({
        success: false,
        message: "addressType must be home, work or other"
      });
    }

    const shouldDefault = Boolean(isDefault) || user.addresses.length === 0;

    if (shouldDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      user: user._id,
      label,
      name,
      phone: req.body.phone,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: shouldDefault
    };

    user.addresses.push(newAddress);

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateAddress(req, res) {
  try {
    const addressId = req.params.addressId || req.params.id;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (req.body.fullName || req.body.name) {
      address.name = req.body.fullName || req.body.name;
    }

    if (req.body.phone) address.phone = req.body.phone;
    if (req.body.street || req.body.addressLine1) {
      address.street = req.body.street || req.body.addressLine1;
    }

    if (req.body.city) address.city = req.body.city;
    if (req.body.state) address.state = req.body.state;
    if (req.body.zipCode || req.body.pincode) {
      address.zipCode = req.body.zipCode || req.body.pincode;
    }

    if (req.body.isDefault === true) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteAddress(req, res) {
  try {
    const addressId = req.params.addressId || req.params.id;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const isDefault = address.isDefault;

    address.deleteOne();

    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function setDefaultAddress(req, res) {
  try {
    const addressId = req.params.addressId || req.params.id;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.addresses.forEach(addr => addr.isDefault = false);

    address.isDefault = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      addresses: user.addresses
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ================= UPDATE PROFILE =================

async function updateProfile(req, res, next) {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      user
    });

  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    const match = await user.comparePassword(currentPassword);

    if (!match) {
      return next(new ApiError(400, "Wrong current password"));
    }

    // New password must be different
    if (currentPassword === newPassword) {
      return next(
        new ApiError(400, "New password must be different from current password")
      );
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    next(error); // send error to global error handler
  }
}

// ================= FORGOT PASSWORD =================
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate OTP
    const otp = user.generateResetPasswordOTP();
    user.isOtpVerified = false;

    await user.save();

    // Send email
    await sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
    );

    // Generate temp token
    const tempToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
      tempToken
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ================= VERIFY RESET OTP =================

async function verifyResetOTP(req, res) {
  try {

    const { otp, tempToken } = req.body;

    if (!otp || !tempToken) {
      return res.status(400).json({
        success: false,
        message: "OTP and tempToken are required"
      });
    }

    // Decode temp token safely
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired tempToken",
      });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: hashedOtp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // OTP verified
    user.isOtpVerified = true;
    await user.save();

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ================= RESET PASSWORD =================

async function resetPassword(req, res) {
  try {

    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "resetToken and newPassword are required"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired resetToken",
      });
    }

    const user = await User.findById(decoded.id)
      .select("+password +resetPasswordToken +resetPasswordExpire +isOtpVerified");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP verification required"
      });
    }

    // Update password
    user.password = newPassword;

    // Clear fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ================= EXPORT CONTROLLERS =================
module.exports = {
  registerUser,
  resendVerificationOTP,
  verifyEmail,
  loginUser,
  logoutUser,
  getProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateProfile,
  changePassword,
  exportUserData,
  forgotPassword,
  verifyResetOTP,
  resetPassword
};
