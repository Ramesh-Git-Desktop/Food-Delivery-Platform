const { body } = require("express-validator");
const {
  mongoIdParam,
  mongoIdBody,
  requiredStringBody,
  optionalBooleanBody,
} = require("./common.validator");

const createCouponValidator = [
  requiredStringBody("code", "Coupon code"),
  body("discountType")
    .notEmpty()
    .withMessage("discountType is required")
    .isIn(["percentage", "flat"])
    .withMessage("discountType must be percentage or flat"),
  body("discountValue")
    .notEmpty()
    .withMessage("discountValue is required")
    .isFloat({ gt: 0 })
    .withMessage("discountValue must be greater than 0"),
  body("minOrderValue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minOrderValue must be a non-negative number"),
  body("maxDiscount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxDiscount must be a non-negative number"),
  body("validFrom")
    .notEmpty()
    .withMessage("validFrom is required")
    .isISO8601()
    .withMessage("validFrom must be a valid date"),
  body("validUntil")
    .notEmpty()
    .withMessage("validUntil is required")
    .isISO8601()
    .withMessage("validUntil must be a valid date"),
  body("usageLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("usageLimit must be a positive integer"),
];

const updateCouponValidator = [
  mongoIdParam("id"),
  body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("code cannot be empty"),
  body("discountType")
    .optional()
    .isIn(["percentage", "flat"])
    .withMessage("discountType must be percentage or flat"),
  body("discountValue")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("discountValue must be greater than 0"),
  body("minOrderValue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minOrderValue must be a non-negative number"),
  body("maxDiscount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxDiscount must be a non-negative number"),
  body("validFrom")
    .optional()
    .isISO8601()
    .withMessage("validFrom must be a valid date"),
  body("validUntil")
    .optional()
    .isISO8601()
    .withMessage("validUntil must be a valid date"),
  body("usageLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("usageLimit must be a positive integer"),
  optionalBooleanBody("isActive", "isActive"),
];

const applyCouponValidator = [
  requiredStringBody("code", "Coupon code"),
  mongoIdBody("cartId", "cartId"),
];

module.exports = {
  createCouponValidator,
  updateCouponValidator,
  applyCouponValidator,
};
