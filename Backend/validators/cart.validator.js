const { body, param, validationResult } = require("express-validator");


// Handle validation errors
exports.validate = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();
};


// ADD TO CART validation
exports.addToCartValidation = [
  body("menuItemId")
    .notEmpty()
    .withMessage("Menu item ID is required"),

  body("restaurantId")
    .notEmpty()
    .withMessage("Restaurant ID is required"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be greater than 0"),

  exports.validate
];


// UPDATE CART validation
exports.updateCartValidation = [

  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be greater than 0"),

  exports.validate
];


// REMOVE ITEM validation
exports.removeCartValidation = [

  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required"),

  exports.validate
];