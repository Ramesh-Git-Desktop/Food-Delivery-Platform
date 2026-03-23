const RestaurantAdmin = require("../models/RestaurantAdmin");
const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const { createNotification } = require("../services/notification.service");
const { auditLog } = require("../services/audit.service");
const { sendEmail } = require("../utils/sendEmail");
const { assertValidObjectId } = require("../utils/objectId");



// @desc    Get all restaurant applications (filter by status)
// @route   GET /api/admin/restaurants
// @access  Private (Admin)
const getAllRestaurants = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;

  const query = {};

  // Filter by status
  if (status && ["pending", "approved", "rejected", "suspended"].includes(status)) {
    query.status = status;
  }

  // Search by owner name or email
  if (search) {
    query.$or = [
      { ownerName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await RestaurantAdmin.countDocuments(query);

  const restaurantAdmins = await RestaurantAdmin.find(query)
    .populate("restaurant", "name city cuisineType")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json(
    new ApiResponse(200, "Restaurant applications fetched", restaurantAdmins, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  );
});

// @desc    Get single restaurant application with full details
// @route   GET /api/admin/restaurants/:id
// @access  Private (Admin)
const getRestaurantById = asyncHandler(async (req, res, next) => {
  const restaurantAdminId = assertValidObjectId(req.params.id, "restaurantAdminId");
  const restaurantAdmin = await RestaurantAdmin.findById(restaurantAdminId).populate("restaurant");

  if (!restaurantAdmin) {
    return next(new ApiError(404, "Restaurant application not found"));
  }

  res.status(200).json(
    new ApiResponse(200, "Restaurant details fetched", restaurantAdmin)
  );
});

// @desc    Approve restaurant
// @route   PUT /api/admin/restaurants/:id/approve
// @access  Private (Admin)
const approveRestaurant = asyncHandler(async (req, res, next) => {
  const restaurantAdminId = assertValidObjectId(req.params.id, "restaurantAdminId");
  const restaurantAdmin = await RestaurantAdmin.findById(restaurantAdminId);

  if (!restaurantAdmin) {
    return next(new ApiError(404, "Restaurant application not found"));
  }

  if (restaurantAdmin.status === "approved") {
    return next(new ApiError(400, "Restaurant is already approved"));
  }

  restaurantAdmin.status = "approved";
  restaurantAdmin.rejectionReason = "";
  await restaurantAdmin.save();
  // restaurant approved 

  await createNotification(
  restaurantAdmin._id,
  "restaurant-admin",
  "Restaurant Application Approved",
  "Your restaurant has been approved and is now live"
);

  await auditLog({
    req,
    action: "RESTAURANT_APPROVED",
    entity: {
      _id: restaurantAdmin.restaurant || restaurantAdmin._id,
      model: restaurantAdmin.restaurant ? "Restaurant" : "RestaurantAdmin",
      label: restaurantAdmin.email
    },
    description: "Restaurant application approved",
    metadata: {
      restaurantAdminId: restaurantAdmin._id,
      status: restaurantAdmin.status
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Restaurant approved successfully", {
      _id: restaurantAdmin._id,
      ownerName: restaurantAdmin.ownerName,
      email: restaurantAdmin.email,
      status: restaurantAdmin.status,
    })
  );
});

// @desc    Reject restaurant with reason
// @route   PUT /api/admin/restaurants/:id/reject
// @access  Private (Admin)
const rejectRestaurant = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new ApiError(400, "Please provide a rejection reason"));
  }

  const restaurantAdminId = assertValidObjectId(req.params.id, "restaurantAdminId");
  const restaurantAdmin = await RestaurantAdmin.findById(restaurantAdminId);

  if (!restaurantAdmin) {
    return next(new ApiError(404, "Restaurant application not found"));
  }

  const rejectionReason = reason.trim();

  if (!rejectionReason) {
    return next(new ApiError(400, "Please provide a rejection reason"));
  }

  if (restaurantAdmin.status !== "pending") {
    return next(new ApiError(400, "Only pending restaurant applications can be rejected"));
  }

  await createNotification(
    restaurantAdmin._id,
    "restaurant-admin",
    "Restaurant Application Rejected",
    `Your restaurant was rejected. Reason: ${rejectionReason}`
  );

  await sendEmail(
    restaurantAdmin.email,
    "Restaurant Application Rejected",
    `Your restaurant registration request has been rejected. Reason: ${rejectionReason}`
  );

  await auditLog({
    req,
    action: "RESTAURANT_REJECTED",
    entity: {
      _id: restaurantAdmin.restaurant || restaurantAdmin._id,
      model: restaurantAdmin.restaurant ? "Restaurant" : "RestaurantAdmin",
      label: restaurantAdmin.email
    },
    description: "Restaurant application rejected",
    metadata: {
      restaurantAdminId: restaurantAdmin._id,
      reason: rejectionReason,
      status: restaurantAdmin.status
    }
  });

  if (restaurantAdmin.restaurant) {
    await Restaurant.findByIdAndDelete(restaurantAdmin.restaurant);
  }

  await restaurantAdmin.deleteOne();

  res.status(200).json(
    new ApiResponse(200, "Restaurant rejected successfully and removed from the system")
  );
});

// @desc    Suspend an approved restaurant
// @route   PUT /api/admin/restaurants/:id/suspend
// @access  Private (Admin)
const suspendRestaurant = asyncHandler(async (req, res, next) => {
  const restaurantAdminId = assertValidObjectId(req.params.id, "restaurantAdminId");
  const restaurantAdmin = await RestaurantAdmin.findById(restaurantAdminId);

  if (!restaurantAdmin) {
    return next(new ApiError(404, "Restaurant not found"));
  }

  if (restaurantAdmin.status !== "approved") {
    return next(new ApiError(400, "Only approved restaurants can be suspended"));
  }

  restaurantAdmin.status = "suspended";
  await restaurantAdmin.save();

  // Also close the restaurant
  await Restaurant.findByIdAndUpdate(restaurantAdmin.restaurant, {
    isOpen: false,
  });

  await auditLog({
    req,
    action: "RESTAURANT_SUSPENDED",
    entity: {
      _id: restaurantAdmin.restaurant || restaurantAdmin._id,
      model: restaurantAdmin.restaurant ? "Restaurant" : "RestaurantAdmin",
      label: restaurantAdmin.email
    },
    description: "Restaurant suspended by admin",
    metadata: {
      restaurantAdminId: restaurantAdmin._id,
      status: restaurantAdmin.status,
      isOpen: false
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Restaurant suspended successfully", {
      _id: restaurantAdmin._id,
      ownerName: restaurantAdmin.ownerName,
      status: restaurantAdmin.status,
    })
  );
});

// @desc    Activate a suspended restaurant
// @route   PUT /api/admin/restaurants/:id/activate
// @access  Private (Admin)
const activateRestaurant = asyncHandler(async (req, res, next) => {
  const restaurantAdminId = assertValidObjectId(req.params.id, "restaurantAdminId");
  const restaurantAdmin = await RestaurantAdmin.findById(restaurantAdminId);

  if (!restaurantAdmin) {
    return next(new ApiError(404, "Restaurant not found"));
  }

  if (restaurantAdmin.status !== "suspended") {
    return next(new ApiError(400, "Only suspended restaurants can be activated"));
  }

  restaurantAdmin.status = "approved";
  await restaurantAdmin.save();

  // Re-open the restaurant when admin activates it again
  await Restaurant.findByIdAndUpdate(restaurantAdmin.restaurant, {
    isOpen: true,
  });

  await createNotification(
    restaurantAdmin._id,
    "restaurant-admin",
    "Restaurant Activated",
    "Your restaurant has been activated and is live again"
  );

  await auditLog({
    req,
    action: "RESTAURANT_ACTIVATED",
    entity: {
      _id: restaurantAdmin.restaurant || restaurantAdmin._id,
      model: restaurantAdmin.restaurant ? "Restaurant" : "RestaurantAdmin",
      label: restaurantAdmin.email
    },
    description: "Restaurant activated by admin",
    metadata: {
      restaurantAdminId: restaurantAdmin._id,
      status: restaurantAdmin.status,
      isOpen: true
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Restaurant activated successfully", {
      _id: restaurantAdmin._id,
      ownerName: restaurantAdmin.ownerName,
      status: restaurantAdmin.status,
    })
  );
});

// @desc    Permanently delete a restaurant
// @route   DELETE /api/admin/restaurants/:id
// @access  Private (Admin)
const deleteRestaurant = asyncHandler(async (req, res, next) => {
  const restaurantAdminId = assertValidObjectId(req.params.id, "restaurantAdminId");
  const restaurantAdmin = await RestaurantAdmin.findById(restaurantAdminId);

  if (!restaurantAdmin) {
    return next(new ApiError(404, "Restaurant not found"));
  }

  // Delete the restaurant
  if (restaurantAdmin.restaurant) {
    await Restaurant.findByIdAndDelete(restaurantAdmin.restaurant);
  }

  await auditLog({
    req,
    action: "RESTAURANT_DELETED",
    entity: {
      _id: restaurantAdmin.restaurant || restaurantAdmin._id,
      model: restaurantAdmin.restaurant ? "Restaurant" : "RestaurantAdmin",
      label: restaurantAdmin.email
    },
    description: "Restaurant deleted permanently",
    metadata: {
      restaurantAdminId: restaurantAdmin._id,
      status: restaurantAdmin.status
    }
  });

  // Delete the restaurant admin
  await RestaurantAdmin.findByIdAndDelete(restaurantAdminId);

  res.status(200).json(
    new ApiResponse(200, "Restaurant deleted permanently")
  );
});

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  approveRestaurant,
  rejectRestaurant,
  suspendRestaurant,
  activateRestaurant,
  deleteRestaurant,
};
