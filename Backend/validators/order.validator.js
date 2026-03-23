const { body } = require("express-validator");
const { mongoIdBody, optionalStringBody } = require("./common.validator");

const createOrderValidator = [
  mongoIdBody("addressId", "addressId"),
  body("paymentMethod")
    .notEmpty()
    .withMessage("paymentMethod is required")
    .isIn(["COD", "UPI", "CARD"])
    .withMessage("paymentMethod must be COD, UPI or CARD"),
  optionalStringBody("couponCode", "couponCode"),
  optionalStringBody("instructions", "instructions")
    .isLength({ max: 500 })
    .withMessage("instructions cannot exceed 500 characters"),
];

module.exports = {
  createOrderValidator,
};
