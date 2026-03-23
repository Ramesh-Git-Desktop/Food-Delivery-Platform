const RestaurantAdmin = require("../models/RestaurantAdmin");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const generateToken = require("../utils/generateToken");
const {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} = require("../utils/cloudinary");
const { createNotification } = require("../services/notification.service");
const { auditLog } = require("../services/audit.service");
const Admin = require("../models/Admin");

const getDateRangeForToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const getGroupFormat = (period) => {
  if (period === "monthly") return "%Y-%m";
  if (period === "weekly") return "%Y-%U";
  return "%Y-%m-%d";
};

const validChartPeriods = ["daily", "weekly", "monthly"];

const getRestaurantAdminWithRestaurant = async (adminId) => {
  const admin = await RestaurantAdmin.findById(adminId).select("restaurant");

  if (!admin || !admin.restaurant) {
    throw new ApiError(404, "Restaurant not found for this admin");
  }

  return admin;
};

const getRestaurantRevenueExpression = () => ({
  $max: [
    {
      $subtract: [
        { $ifNull: ["$pricing.grandTotal", 0] },
        { $ifNull: ["$pricing.deliveryFee", 0] }
      ]
    },
    0
  ]
});


const register = asyncHandler(async (req, res, next) => {
  const { ownerName, email, password, phone } = req.body;
  const {
    restaurantName,
    restaurantAddress,
    restaurantCity,
    restaurantState,
    restaurantPincode,
    restaurantPhone,
    cuisineType,
    openingTime,
    closingTime,
    deliveryRadius,
    avgDeliveryTime,
  } = req.body;

  // Check if email already exists
  const existingAdmin = await RestaurantAdmin.findOne({ email });
  if (existingAdmin) {
    return next(new ApiError(409, "Email already registered"));
  }

  // Handle file uploads to Cloudinary
  let logo = "";
  let images = [];
  let fssaiLicense = "";
  let gstCertificate = "";
  let panCard = "";

  if (req.files) {
    if (req.files.restaurantLogo) {
      const result = await uploadToCloudinary(
        req.files.restaurantLogo[0].path,
        "food-order/restaurants/logos"
      );
      logo = result.url;
    }
    if (req.files.restaurantImages) {
      const results = await uploadMultipleToCloudinary(
        req.files.restaurantImages,
        "food-order/restaurants/images"
      );
      images = results.map((r) => r.url);
    }
    if (req.files.fssaiLicense) {
      const result = await uploadToCloudinary(
        req.files.fssaiLicense[0].path,
        "food-order/restaurants/documents"
      );
      fssaiLicense = result.url;
    }
    if (req.files.gstCertificate) {
      const result = await uploadToCloudinary(
        req.files.gstCertificate[0].path,
        "food-order/restaurants/documents"
      );
      gstCertificate = result.url;
    }
    if (req.files.panCard) {
      const result = await uploadToCloudinary(
        req.files.panCard[0].path,
        "food-order/restaurants/documents"
      );
      panCard = result.url;
    }
  }

  // Parse cuisineType if it's a string
  let parsedCuisineType = cuisineType;
  if (typeof cuisineType === "string") {
    try {
      parsedCuisineType = JSON.parse(cuisineType);
    } catch {
      parsedCuisineType = cuisineType.split(",").map((c) => c.trim());
    }
  }

  // Create Restaurant Admin (status = pending)
  const restaurantAdmin = await RestaurantAdmin.create({
    ownerName,
    email,
    password,
    phone,
  });

  // Create Restaurant linked to this admin
  const restaurant = await Restaurant.create({
    name: restaurantName,
    address: restaurantAddress,
    city: restaurantCity,
    state: restaurantState,
    pincode: restaurantPincode,
    phone: restaurantPhone,
    logo,
    images,
    cuisineType: parsedCuisineType,
    openingTime,
    closingTime,
    deliveryRadius: deliveryRadius || 10,
    avgDeliveryTime: avgDeliveryTime || 30,
    documents: {
      fssaiLicense,
      gstCertificate,
      panCard,
    },
    admin: restaurantAdmin._id,
  });

  // Link restaurant to admin
  restaurantAdmin.restaurant = restaurant._id;
  await restaurantAdmin.save();
  // 🔔 Notify Main Admin
  const mainAdmin = await Admin.findOne({ role: "main-admin" });

  if (mainAdmin) {
    await createNotification(
      mainAdmin._id,
      "main-admin",
      "New Restaurant Registration",
      `Restaurant ${restaurantName} applied for approval`
    );
  }

  await auditLog({
    action: "RESTAURANT_REGISTRATION_SUBMITTED",
    entity: {
      _id: restaurant._id,
      model: "Restaurant",
      label: restaurant.name
    },
    description: "Restaurant registration submitted",
    metadata: {
      restaurantAdminId: restaurantAdmin._id,
      ownerName: restaurantAdmin.ownerName,
      email: restaurantAdmin.email,
      status: restaurantAdmin.status,
      city: restaurant.city
    }
  });


  res.status(201).json(
    new ApiResponse(201, "Registration submitted successfully. Awaiting admin approval.", {
      _id: restaurantAdmin._id,
      ownerName: restaurantAdmin.ownerName,
      email: restaurantAdmin.email,
      status: restaurantAdmin.status,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
      },
    })
  );
});


const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  const admin = await RestaurantAdmin.findOne({ email }).select("+password");
  if (!admin) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  // Check approval status
  if (admin.status === "pending") {
    return next(
      new ApiError(403, "Your account is pending approval from the admin")
    );
  }
  if (admin.status === "rejected") {
    return next(
      new ApiError(
        403,
        `Your account was rejected. Reason: ${admin.rejectionReason || "Not specified"}`
      )
    );
  }
  if (admin.status === "suspended") {
    return next(
      new ApiError(
        403,
        "Your account is suspended. You can't log in until it is activated by the admin"
      )
    );
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  const token = generateToken(admin, res);
  // 🔔 Login Notification
  await createNotification(
    admin._id,
    "restaurant-admin",
    "Login Successful",
    "You have logged into your restaurant admin account"
  );

  const response = new ApiResponse(200, "Login successful", {
    _id: admin._id,
    ownerName: admin.ownerName,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    restaurant: admin.restaurant,
  });
  response.token = token;

  res.status(200).json(response);
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
  const admin = await RestaurantAdmin.findById(req.user._id).populate(
    "restaurant"
  );

  res.status(200).json(new ApiResponse(200, "Profile fetched", admin));
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { ownerName, phone } = req.body;

  const admin = await RestaurantAdmin.findById(req.user._id);
  if (!admin) {
    return next(new ApiError(404, "Restaurant admin not found"));
  }

  if (ownerName) admin.ownerName = ownerName;
  if (phone) admin.phone = phone;

  await admin.save();

  res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", {
      _id: admin._id,
      ownerName: admin.ownerName,
      email: admin.email,
      phone: admin.phone,
    })
  );
});

const checkStatus = asyncHandler(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(new ApiError(400, "Please provide an email"));
  }

  const admin = await RestaurantAdmin.findOne({ email }).select(
    "ownerName email status rejectionReason createdAt"
  );

  if (!admin) {
    return next(new ApiError(404, "No application found with this email"));
  }

  res.status(200).json(new ApiResponse(200, "Status fetched", admin));
});

// @desc    Restaurant admin dashboard stats
// @route   GET /api/restaurant-admin/dashboard/stats
// @access  Private (RestaurantAdmin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const admin = await getRestaurantAdminWithRestaurant(req.user._id);
  const { start, end } = getDateRangeForToday();

  const baseFilter = {
    restaurant: admin.restaurant,
    createdAt: { $gte: start, $lt: end }
  };

  const [todayOrders, totalOrders, pendingOrders, totalItems, totals] = await Promise.all([
    Order.countDocuments(baseFilter),
    Order.countDocuments({ restaurant: admin.restaurant }),
    Order.countDocuments({
      restaurant: admin.restaurant,
      status: { $nin: ["DELIVERED", "CANCELLED"] }
    }),
    MenuItem.countDocuments({ restaurant: admin.restaurant }),
    Order.aggregate([
      {
        $match: {
          ...baseFilter,
          status: "DELIVERED"
        }
      },
      {
        $project: {
          revenue: getRestaurantRevenueExpression(),
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" }
        }
      }
    ])
  ]);

  const summary = totals[0] || { totalRevenue: 0 };

  res.status(200).json(
    new ApiResponse(200, "Restaurant dashboard stats fetched", {
      todayOrders,
      totalOrders,
      revenue: summary.totalRevenue,
      pendingOrders,
      totalItems
    })
  );
});

// @desc    Restaurant admin revenue chart
// @route   GET /api/restaurant-admin/dashboard/revenue
// @access  Private (RestaurantAdmin)
const getRevenueChart = asyncHandler(async (req, res) => {
  const admin = await getRestaurantAdminWithRestaurant(req.user._id);
  const period = String(req.query.period || "daily").trim().toLowerCase();

  if (!validChartPeriods.includes(period)) {
    throw new ApiError(400, "period must be one of: daily, weekly, monthly");
  }

  const groupFormat = getGroupFormat(period);

  const revenue = await Order.aggregate([
    {
      $match: {
        restaurant: admin.restaurant,
        status: "DELIVERED"
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        revenue: { $sum: getRestaurantRevenueExpression() },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json(
    new ApiResponse(200, "Restaurant revenue chart fetched", revenue)
  );
});

// @desc    Restaurant admin popular items
// @route   GET /api/restaurant-admin/dashboard/popular-items
// @access  Private (RestaurantAdmin)
const getPopularItems = asyncHandler(async (req, res) => {
  const admin = await getRestaurantAdminWithRestaurant(req.user._id);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new ApiError(400, "limit must be a positive integer");
  }

  const popularItems = await Order.aggregate([
    {
      $match: {
        restaurant: admin.restaurant,
        status: "DELIVERED"
      }
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItem",
        name: { $first: "$items.name" },
        totalOrderedQuantity: { $sum: { $ifNull: ["$items.quantity", 0] } },
        totalRevenue: { $sum: { $ifNull: ["$items.total", 0] } }
      }
    },
    { $sort: { totalOrderedQuantity: -1, totalRevenue: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        name: 1,
        totalOrderedQuantity: 1,
        totalRevenue: 1
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, "Popular items fetched", popularItems)
  );
});

// @desc    Toggle restaurant open/close status
// @route   PUT /api/restaurant-admin/restaurant/toggle-status
// @access  Private (RestaurantAdmin)
const toggleRestaurantStatus = asyncHandler(async (req, res) => {
  const admin = await getRestaurantAdminWithRestaurant(req.user._id);
  const restaurant = await Restaurant.findById(admin.restaurant).select("name isOpen");

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (typeof req.body.isOpen === "boolean") {
    restaurant.isOpen = req.body.isOpen;
  } else {
    restaurant.isOpen = !restaurant.isOpen;
  }

  await restaurant.save();

  await auditLog({
    req,
    action: "RESTAURANT_STATUS_TOGGLED",
    entity: {
      _id: restaurant._id,
      model: "Restaurant",
      label: restaurant.name
    },
    description: "Restaurant open status updated",
    metadata: {
      isOpen: restaurant.isOpen,
      restaurantAdminId: admin._id
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Restaurant status updated", {
      _id: restaurant._id,
      name: restaurant.name,
      isOpen: restaurant.isOpen
    })
  );
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  checkStatus,
  getDashboardStats,
  getRevenueChart,
  getPopularItems,
  toggleRestaurantStatus
};
