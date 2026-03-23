const Review = require("../models/Review");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Rider = require("../models/Rider");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");

const formatReviewResponse = (reviewDoc) => {
  const review = reviewDoc.toObject ? reviewDoc.toObject() : { ...reviewDoc };

  delete review.type;

  if (review.restaurant == null) {
    delete review.restaurant;
  }

  if (review.rider == null) {
    delete review.rider;
  }

  return review;
};

const updateRestaurantRatingSummary = async (restaurantId) => {
  const [summary] = await Review.aggregate([
    {
      $match: {
        type: "restaurant",
        restaurant: restaurantId,
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  await Restaurant.findByIdAndUpdate(restaurantId, {
    avgRating: summary ? Number(summary.avgRating.toFixed(1)) : 0,
    totalRatings: summary ? summary.totalRatings : 0,
  });
};

const updateRiderRatingSummary = async (riderId) => {
  const [summary] = await Review.aggregate([
    {
      $match: {
        type: "rider",
        rider: riderId,
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  await Rider.findByIdAndUpdate(riderId, {
    avgRating: summary ? Number(summary.avgRating.toFixed(1)) : 0,
    totalRatings: summary ? summary.totalRatings : 0,
  });
};

const syncEntityRatingSummary = async (review) => {
  if (review.type === "restaurant" && review.restaurant) {
    await updateRestaurantRatingSummary(review.restaurant);
    return;
  }

  if (review.type === "rider" && review.rider) {
    await updateRiderRatingSummary(review.rider);
  }
};

const createRestaurantReview = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { orderId, rating, comment } = req.body;

  const restaurant = await Restaurant.findById(restaurantId).select("_id name");

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    restaurant: restaurantId,
  }).select("_id status");

  if (!order) {
    throw new ApiError(
      400,
      "A valid order for this restaurant with the given orderId was not found"
    );
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(400, "You can't review a cancelled order");
  }

  if (order.status !== "DELIVERED") {
    throw new ApiError(
      400,
      "A delivered order for this restaurant with the given orderId was not found"
    );
  }

  const existingReview = await Review.findOne({
    user: req.user._id,
    order: orderId,
    type: "restaurant",
  }).select("_id");

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this order for the restaurant");
  }

  const review = await Review.create({
    user: req.user._id,
    order: orderId,
    restaurant: restaurantId,
    type: "restaurant",
    rating: Number(rating),
    review: comment?.trim() || "",
  });

  await syncEntityRatingSummary(review);

  const populatedReview = await Review.findById(review._id)
    .populate("user", "name")
    .populate("order", "orderNumber deliveredAt")
    .populate("restaurant", "name");

  res.status(201).json(
    new ApiResponse(
      201,
      "Restaurant review added successfully",
      formatReviewResponse(populatedReview)
    )
  );
});

const getRestaurantReviews = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const restaurant = await Restaurant.findById(restaurantId).select("_id");

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const filter = {
    type: "restaurant",
    restaurant: restaurantId,
  };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      "Restaurant reviews fetched successfully",
      reviews.map(formatReviewResponse),
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      }
    )
  );
});

const createRiderReview = asyncHandler(async (req, res) => {
  const { riderId } = req.params;
  const { orderId, rating, comment } = req.body;

  const rider = await Rider.findById(riderId).select("_id name");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    rider: riderId,
  }).select("_id status");

  if (!order) {
    throw new ApiError(
      400,
      "A valid order for this rider with the given orderId was not found"
    );
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(400, "You can't review a cancelled order");
  }

  if (order.status !== "DELIVERED") {
    throw new ApiError(
      400,
      "A delivered order for this rider with the given orderId was not found"
    );
  }

  const existingReview = await Review.findOne({
    user: req.user._id,
    order: orderId,
    type: "rider",
  }).select("_id");

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this order for the rider");
  }

  const review = await Review.create({
    user: req.user._id,
    order: orderId,
    rider: riderId,
    type: "rider",
    rating: Number(rating),
    review: comment?.trim() || "",
  });

  await syncEntityRatingSummary(review);

  const populatedReview = await Review.findById(review._id)
    .populate("user", "name")
    .populate("order", "orderNumber deliveredAt")
    .populate("rider", "name");

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Rider review added successfully",
        formatReviewResponse(populatedReview)
      )
    );
});

const getRiderReviews = asyncHandler(async (req, res) => {
  const { riderId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const rider = await Rider.findById(riderId).select("_id");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  const filter = {
    type: "rider",
    rider: riderId,
  };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name")
      .populate("rider", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      "Rider reviews fetched successfully",
      reviews.map(formatReviewResponse),
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      }
    )
  );
});

const deleteOwnReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (String(review.user) !== String(req.user._id)) {
    throw new ApiError(403, "You can delete only your own review");
  }

  await review.deleteOne();
  await syncEntityRatingSummary(review);

  res.status(200).json(new ApiResponse(200, "Review deleted successfully"));
});

const adminDeleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await review.deleteOne();
  await syncEntityRatingSummary(review);

  res
    .status(200)
    .json(new ApiResponse(200, "Review deleted successfully by admin"));
});

module.exports = {
  createRestaurantReview,
  getRestaurantReviews,
  createRiderReview,
  getRiderReviews,
  deleteOwnReview,
  adminDeleteReview,
};
