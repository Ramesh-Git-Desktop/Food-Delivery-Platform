const { body, param, query } = require("express-validator");

const mongoIdMessage = "Invalid ID format";

const restaurantIdParamValidator = [
  param("restaurantId").isMongoId().withMessage(mongoIdMessage),
];

const riderIdParamValidator = [
  param("riderId").isMongoId().withMessage(mongoIdMessage),
];

const restaurantReviewValidator = [
  ...restaurantIdParamValidator,
  body("orderId")
    .notEmpty()
    .withMessage("orderId is required")
    .isMongoId()
    .withMessage("orderId must be a valid MongoDB ObjectId"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Comment must be between 5 and 500 characters"),
];

const riderReviewValidator = [
  ...riderIdParamValidator,
  body("orderId")
    .notEmpty()
    .withMessage("orderId is required")
    .isMongoId()
    .withMessage("orderId must be a valid MongoDB ObjectId"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Comment must be between 5 and 500 characters"),
];

const getEntityReviewsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50"),
];

const deleteReviewValidator = [
  param("reviewId").isMongoId().withMessage(mongoIdMessage),
];

module.exports = {
  restaurantIdParamValidator,
  riderIdParamValidator,
  restaurantReviewValidator,
  riderReviewValidator,
  getEntityReviewsValidator,
  deleteReviewValidator,
};
