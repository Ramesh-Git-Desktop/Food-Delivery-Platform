const express = require("express");
const router = express.Router();

const {
  createRestaurantReview,
  getRestaurantReviews,
  createRiderReview,
  getRiderReviews,
  deleteOwnReview,
} = require("../controllers/review.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  restaurantIdParamValidator,
  riderIdParamValidator,
  restaurantReviewValidator,
  riderReviewValidator,
  getEntityReviewsValidator,
  deleteReviewValidator,
} = require("../validators/review.validator");
const { reviewSubmissionLimiter } = require("../middlewares/rateLimiter");

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *
 * /api/reviews/restaurant/{restaurantId}:
 *   get:
 *     summary: Get restaurant reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant reviews fetched
 *   post:
 *     summary: Create restaurant review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review created
 */

router.post(
  "/restaurant/:restaurantId",
  protect,
  authorize("user"),
  reviewSubmissionLimiter,
  restaurantReviewValidator,
  validate,
  createRestaurantReview
);

router.get(
  "/restaurant/:restaurantId",
  getEntityReviewsValidator,
  restaurantIdParamValidator,
  validate,
  getRestaurantReviews
);

router.post(
  "/rider/:riderId",
  protect,
  authorize("user"),
  reviewSubmissionLimiter,
  riderReviewValidator,
  validate,
  createRiderReview
);

router.get(
  "/rider/:riderId",
  getEntityReviewsValidator,
  riderIdParamValidator,
  validate,
  getRiderReviews
);

router.delete(
  "/:reviewId",
  protect,
  authorize("user"),
  deleteReviewValidator,
  validate,
  deleteOwnReview
);

module.exports = router;
