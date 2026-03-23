const Rider = require("../models/Rider");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { createNotification } = require("../services/notification.service");
const { auditLog } = require("../services/audit.service");
const { assertValidObjectId } = require("../utils/objectId");
const Admin = require("../models/Admin");
const {
  ORDER_DEFAULTS,
  RIDER_AUTH,
  RIDER_EARNINGS_FILTERS,
} = require("../config/constants");


const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
const validOrderStatuses = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "PREPARED",
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
  "CANCELLED"
];
const availableOrderStatuses = ["PLACED", "CONFIRMED", "PREPARING", "PREPARED"];
const validVehicleTypes = ["bike", "scooter", "bicycle"];
const ensureRiderAccountActive = async (rider) => {
  await rider.refreshSuspensionStatus();

  if (rider.status === "suspended") {
    throw new ApiError(403, "Your rider account is suspended");
  }

  if (rider.status !== "approved") {
    throw new ApiError(403, "Your rider account is not active");
  }
};

const getTodayDateRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const getChartGroupFormat = (period) => {
  if (period === "monthly") return "%Y-%m";
  if (period === "weekly") return "%Y-%U";
  return "%Y-%m-%d";
};


// ================= REGISTER RIDER =================
const registerRider = asyncHandler(async (req, res) => {

  const {
    name,
    email,
    password,
    phone,
    vehicleType,
    vehicleNumber
  } = req.body;

  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, "Please enter a valid email address");
  }

  if (!passwordRegex.test(password || "")) {
    throw new ApiError(
      400,
      "Password must contain at least 8 characters, one uppercase letter, and one number"
    );
  }

  const existing = await Rider.findOne({ email: normalizedEmail });

  if (existing) {
    throw new ApiError(400, "Rider already registered");
  }

  let profilePhoto = "";
  let drivingLicense = "";
  let aadharCard = "";
  let vehicleRC = "";

  if (req.files?.profilePhoto?.[0]?.path) {
    const result = await uploadToCloudinary(
      req.files.profilePhoto[0].path,
      "food-order/riders/profile"
    );
    profilePhoto = result.url;
  }

  if (req.files?.drivingLicense?.[0]?.path) {
    const result = await uploadToCloudinary(
      req.files.drivingLicense[0].path,
      "food-order/riders/documents"
    );
    drivingLicense = result.url;
  }

  if (req.files?.aadharCard?.[0]?.path) {
    const result = await uploadToCloudinary(
      req.files.aadharCard[0].path,
      "food-order/riders/documents"
    );
    aadharCard = result.url;
  }

  if (req.files?.vehicleRC?.[0]?.path) {
    const result = await uploadToCloudinary(
      req.files.vehicleRC[0].path,
      "food-order/riders/documents"
    );
    vehicleRC = result.url;
  }

  const rider = await Rider.create({
    name,
    email: normalizedEmail,
    password,
    phone,
    vehicleType,
    vehicleNumber,
    profilePhoto,
    documents: {
      drivingLicense,
      aadharCard,
      vehicleRC
    }
  });
  const riderResponse = rider.toObject();
  delete riderResponse.password;
  // 🔔 Notify Main Admin
  const admin = await Admin.findOne({ role: "main-admin" });

  if (admin) {
    await createNotification(
      admin._id,
      "main-admin",
      "New Rider Registration",
      `New rider ${name} has applied for approval`
    );
  }

  res.status(201).json(
    new ApiResponse(201, "Rider registered successfully. Waiting for admin approval", {
      rider: riderResponse
    })
  );

});

// ================= CHECK APPLICATION STATUS =================
const checkApplicationStatus = asyncHandler(async (req, res) => {

  const normalizedEmail = req.query.email?.toLowerCase().trim();

  if (!normalizedEmail) {
    throw new ApiError(400, "Please provide an email");
  }

  const rider = await Rider.findOne({ email: normalizedEmail }).select(
    "name email status rejectionReason createdAt"
  );

  if (!rider) {
    throw new ApiError(404, "No application found with this email");
  }

  await rider.refreshSuspensionStatus();

  res.status(200).json(
    new ApiResponse(200, "Status fetched", rider)
  );

});


// ================= LOGIN RIDER =================
const loginRider = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  const normalizedEmail = email?.toLowerCase().trim();

  const rider = await Rider.findOne({ email: normalizedEmail }).select("+password");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await rider.refreshSuspensionStatus();

  if (rider.status === "suspended") {
    const suspendedUntilText = rider.suspendedUntil
      ? ` Please try again after ${rider.suspendedUntil.toISOString()}.`
      : "";
    const suspensionReasonText = rider.suspensionReason
      ? ` Reason: ${rider.suspensionReason}.`
      : "";

    throw new ApiError(
      403,
      `Your account is suspended.${suspensionReasonText}${suspendedUntilText}`.trim()
    );
  }

  if (rider.status !== "approved") {
    throw new ApiError(403, "Rider not approved yet");
  }

  const isPasswordCorrect = await rider.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    { id: rider._id, role: rider.role },
    process.env.JWT_SECRET,
    { expiresIn: RIDER_AUTH.tokenExpiry }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: false, // change to true in production (HTTPS)
    maxAge: RIDER_AUTH.cookieMaxAgeMs
  };

  const riderData = rider.toObject();
  delete riderData.password;
  // 🔔 Rider login notification
  await createNotification(
    rider._id,
    "rider",
    "Login Successful",
    "You have logged into your rider account"
  );

  res
    .status(200)
    .cookie("riderToken", token, cookieOptions)
    .json(
      new ApiResponse(200, "Login successful", { rider: riderData, token })
    );

});

// ================= LOGOUT RIDER =================
const logoutRider = asyncHandler(async (req, res) => {

  res.clearCookie("riderToken");

  res.status(200).json(
    new ApiResponse(200, "Rider logged out successfully")
  );

});

// ================= GET PROFILE =================
const getProfile = asyncHandler(async (req, res) => {

  const rider = await Rider.findById(req.user._id).select("-password");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await rider.refreshSuspensionStatus();

  res.status(200).json(
    new ApiResponse(200, "Profile fetched", rider)
  );

});


// ================= UPDATE PROFILE =================
const updateProfile = asyncHandler(async (req, res) => {

  const { name, phone, vehicleType, vehicleNumber } = req.body;

  const rider = await Rider.findById(req.user._id);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  if (name) rider.name = name;
  if (phone) rider.phone = phone;
  if (vehicleType !== undefined) {
    const normalizedVehicleType = String(vehicleType).trim().toLowerCase();

    if (!validVehicleTypes.includes(normalizedVehicleType)) {
      throw new ApiError(400, "vehicleType must be one of: bike, scooter, bicycle");
    }

    rider.vehicleType = normalizedVehicleType;
  }
  if (vehicleNumber !== undefined) {
    rider.vehicleNumber = String(vehicleNumber).trim();
  }

  await rider.save();

  res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", rider)
  );

});

// ================= GET AVAILABLE ORDERS =================
const getAvailableOrders = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.user._id).select("status");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await ensureRiderAccountActive(rider);

  const orders = await Order.find({
    status: { $in: availableOrderStatuses },
    rider: null
  }).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, "Available orders fetched", orders)
  );

});


// ================= ACCEPT ORDER =================
const acceptOrder = asyncHandler(async (req, res) => {

  const orderId = assertValidObjectId(req.params.orderId, "orderId");
  const rider = await Rider.findById(req.user._id);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await ensureRiderAccountActive(rider);

  if (!rider.isAvailable) {
    throw new ApiError(400, "Turn on availability before accepting orders");
  }

  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: { $nin: ["DELIVERED", "CANCELLED"] },
      rider: null
    },
    {
      $set: { rider: req.user._id }
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!order) {
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      throw new ApiError(404, "Order not found");
    }

    if (["DELIVERED", "CANCELLED"].includes(existingOrder.status)) {
      throw new ApiError(400, "This order can no longer be accepted");
    }

    if (existingOrder.rider) {
      if (String(existingOrder.rider) === String(req.user._id)) {
        throw new ApiError(400, "You have already accepted this order");
      }

      throw new ApiError(400, "Order is already assigned to another rider");
    }
  }

  await auditLog({
    req,
    action: "ORDER_ACCEPTED_BY_RIDER",
    entity: {
      _id: order._id,
      model: "Order",
      label: order.orderNumber
    },
    description: "Rider accepted order",
    metadata: {
      riderId: req.user._id,
      restaurantId: order.restaurant,
      userId: order.user,
      orderStatus: order.status
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Order accepted successfully", order)
  );

});


// ================= MARK ORDER PICKED UP =================
const markPickedUp = asyncHandler(async (req, res) => {

  const orderId = assertValidObjectId(req.params.orderId, "orderId");
  const rider = await Rider.findById(req.user._id).select("status");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await ensureRiderAccountActive(rider);

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!order.rider || String(order.rider) !== String(req.user._id)) {
    throw new ApiError(403, "You can mark picked up only for orders assigned to you");
  }

  if (order.status === "PICKED_UP") {
    throw new ApiError(400, "Order is already marked as picked up");
  }

  if (order.status === "DELIVERED") {
    throw new ApiError(400, "Delivered order cannot be marked as picked up");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(400, "Cancelled order cannot be marked as picked up");
  }

  if (order.status !== "PREPARED") {
    throw new ApiError(400, "Order must be prepared before it can be marked as picked up");
  }

  const previousStatus = order.status;
  order.status = "PICKED_UP";

  await order.save();

  await auditLog({
    req,
    action: "ORDER_MARKED_PICKED_UP",
    entity: {
      _id: order._id,
      model: "Order",
      label: order.orderNumber
    },
    description: "Rider marked order as picked up",
    metadata: {
      riderId: req.user._id,
      restaurantId: order.restaurant,
      userId: order.user,
      previousStatus,
      newStatus: order.status
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Order marked as picked up", order)
  );

});


// ================= MARK ORDER DELIVERED =================
const markDelivered = asyncHandler(async (req, res) => {

  const orderId = assertValidObjectId(req.params.orderId, "orderId");
  const rider = await Rider.findById(req.user._id).select("status");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await ensureRiderAccountActive(rider);

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!order.rider || String(order.rider) !== String(req.user._id)) {
    throw new ApiError(403, "You can mark delivered only for orders assigned to you");
  }

  if (order.status === "DELIVERED") {
    throw new ApiError(400, "Order is already marked as delivered");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(400, "Cancelled order cannot be marked as delivered");
  }

  if (order.status !== "PICKED_UP") {
    throw new ApiError(400, "Order must be marked as picked up before delivery");
  }

  const deliveredAt = new Date();
  const deliveryFee = Number(order.pricing?.deliveryFee ?? ORDER_DEFAULTS.deliveryFee);
  const session = await mongoose.startSession();
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      updatedOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          rider: req.user._id,
          status: "PICKED_UP"
        },
        {
          $set: {
            status: "DELIVERED",
            deliveredAt,
            ...(order.paymentMethod === "COD" ? { paymentStatus: "PAID" } : {})
          }
        },
        {
          new: true,
          runValidators: true,
          session
        }
      );

      if (!updatedOrder) {
        throw new ApiError(409, "Order could not be marked as delivered");
      }

      const riderUpdate = await Rider.updateOne(
        { _id: req.user._id },
        {
          $inc: {
            totalDeliveries: 1,
            totalEarnings: deliveryFee
          }
        },
        { session }
      );

      if (!riderUpdate.matchedCount) {
        throw new ApiError(404, "Rider not found");
      }
    });
  } finally {
    await session.endSession();
  }

  if (!updatedOrder) {
    throw new ApiError(500, "Failed to update delivery status");
  }

  await auditLog({
    req,
    action: "ORDER_MARKED_DELIVERED",
    entity: {
      _id: updatedOrder._id,
      model: "Order",
      label: updatedOrder.orderNumber
    },
    description: "Rider marked order as delivered",
    metadata: {
      riderId: req.user._id,
      restaurantId: updatedOrder.restaurant,
      userId: updatedOrder.user,
      previousStatus: "PICKED_UP",
      newStatus: updatedOrder.status,
      deliveredAt: updatedOrder.deliveredAt,
      paymentStatus: updatedOrder.paymentStatus
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Order delivered successfully", updatedOrder)
  );

});


// ================= GET MY ORDERS =================
const getMyOrders = asyncHandler(async (req, res) => {

  const { status } = req.query;

  const filter = { rider: req.user._id };

  if (status) {
    const normalizedStatus = String(status).trim().toUpperCase().replace(/[\s-]+/g, "_");

    if (!validOrderStatuses.includes(normalizedStatus)) {
      throw new ApiError(400, "Invalid status filter");
    }

    filter.status = normalizedStatus;
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, "Rider orders fetched", orders)
  );

});


// ================= GET RIDER EARNINGS =================
const getEarnings = asyncHandler(async (req, res) => {
  const { range } = req.query;

  const rider = await Rider.findById(req.user._id);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await ensureRiderAccountActive(rider);

  if (!range) {
    return res.status(200).json(
      new ApiResponse(200, "Earnings summary", {
        range: "all",
        totalDeliveries: rider.totalDeliveries,
        totalEarnings: rider.totalEarnings
      })
    );
  }

  const normalizedRange = String(range).trim().toLowerCase();
  const days = RIDER_EARNINGS_FILTERS[normalizedRange];

  if (!days) {
    throw new ApiError(400, "range must be one of: last-week, last-30-days, last-60-days");
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const deliveredOrders = await Order.find({
    rider: req.user._id,
    status: "DELIVERED",
    deliveredAt: { $gte: fromDate }
  }).select("pricing.deliveryFee");

  const totalDeliveries = deliveredOrders.length;
  const totalEarnings = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.pricing?.deliveryFee ?? ORDER_DEFAULTS.deliveryFee),
    0
  );

  res.status(200).json(
    new ApiResponse(200, "Earnings summary", {
      range: normalizedRange,
      totalDeliveries,
      totalEarnings
    })
  );

});


// ================= TOGGLE AVAILABILITY =================
const toggleAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const rider = await Rider.findById(req.user._id);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await ensureRiderAccountActive(rider);

  if (typeof isAvailable === "boolean") {
    rider.isAvailable = isAvailable;
  } else {
    rider.isAvailable = !rider.isAvailable;
  }

  await rider.save();
  await auditLog({
    req,
    action: "RIDER_AVAILABILITY_UPDATED",
    entity: {
      _id: rider._id,
      model: "Rider",
      label: rider.email
    },
    description: "Rider availability updated",
    metadata: {
      isAvailable: rider.isAvailable
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Availability updated", {
      isAvailable: rider.isAvailable
    })
  );

});

// ================= CANCEL ASSIGNED ORDER =================
const cancelAssignedOrder = asyncHandler(async (req, res) => {
  const orderId = assertValidObjectId(req.params.orderId, "orderId");

  const rider = await Rider.findById(req.user._id).select("status");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await ensureRiderAccountActive(rider);

  const order = await Order.findOne({
    _id: orderId,
    rider: req.user._id
  });

  if (!order) {
    throw new ApiError(404, "Order not found for this rider");
  }

  if (!["PLACED", "CONFIRMED"].includes(order.status)) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  const previousStatus = order.status;
  order.status = "CANCELLED";
  order.cancelledBy = "RIDER";

  await order.save();

  await auditLog({
    req,
    action: "ORDER_CANCELLED_BY_RIDER",
    entity: {
      _id: order._id,
      model: "Order",
      label: order.orderNumber
    },
    description: "Rider cancelled assigned order",
    metadata: {
      riderId: req.user._id,
      restaurantId: order.restaurant,
      userId: order.user,
      previousStatus,
      newStatus: order.status,
      cancelledBy: order.cancelledBy
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Order cancelled successfully", order)
  );
});

// ================= GET RIDER DASHBOARD STATS =================
const getDashboardStats = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.user._id).select("avgRating totalDeliveries totalEarnings");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Rider dashboard stats fetched", {
      totalDeliveries: rider.totalDeliveries || 0,
      earnings: rider.totalEarnings || 0,
      rating: rider.avgRating || 0
    })
  );
});

// ================= GET RIDER EARNINGS CHART =================
const getEarningsChart = asyncHandler(async (req, res) => {
  const period = String(req.query.period || "daily").trim().toLowerCase();
  const groupFormat = getChartGroupFormat(period);

  if (!["daily", "weekly", "monthly"].includes(period)) {
    throw new ApiError(400, "period must be one of: daily, weekly, monthly");
  }

  const chart = await Order.aggregate([
    {
      $match: {
        rider: req.user._id,
        status: "DELIVERED"
      }
    },
    {
      $addFields: {
        chartDate: {
          $ifNull: [
            "$deliveredAt",
            { $ifNull: ["$updatedAt", "$createdAt"] }
          ]
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$chartDate" } },
        earnings: {
          $sum: { $ifNull: ["$pricing.deliveryFee", ORDER_DEFAULTS.deliveryFee] }
        },
        totalDeliveries: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json(
    new ApiResponse(200, "Rider earnings chart fetched", chart)
  );
});

module.exports = {
  registerRider,
  checkApplicationStatus,
  loginRider,
  logoutRider,
  getProfile,
  updateProfile,
  getAvailableOrders,
  acceptOrder,
  markPickedUp,
  markDelivered,
  getMyOrders,
  getEarnings,
  toggleAvailability,
  cancelAssignedOrder,
  getDashboardStats,
  getEarningsChart
};
