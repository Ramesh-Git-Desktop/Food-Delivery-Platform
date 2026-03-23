const { body } = require("express-validator");
const {
  mongoIdParam,
  mongoIdBody,
  requiredStringBody,
  optionalStringBody,
  optionalBooleanBody,
} = require("./common.validator");

const createCategoryValidator = [
  mongoIdParam("restaurantId"),
  requiredStringBody("name", "Category name"),
  optionalBooleanBody("isActive", "isActive"),
];

const updateCategoryValidator = [
  mongoIdParam("restaurantId"),
  mongoIdParam("categoryId"),
  optionalStringBody("name", "Category name"),
  optionalBooleanBody("isActive", "isActive"),
];

const createMenuItemValidator = [
  mongoIdParam("restaurantId"),
  requiredStringBody("name", "Menu item name"),
  mongoIdBody("category", "Category"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  optionalStringBody("description", "Description"),
  optionalBooleanBody("isVeg", "isVeg"),
  optionalBooleanBody("isAvailable", "isAvailable"),
  body("preparationTime")
    .optional()
    .isInt({ min: 0 })
    .withMessage("preparationTime must be a non-negative integer"),
];

const updateMenuItemValidator = [
  mongoIdParam("restaurantId"),
  mongoIdParam("itemId"),
  optionalStringBody("name", "Menu item name"),
  optionalStringBody("description", "Description"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("category must be a valid MongoDB ObjectId"),
  optionalBooleanBody("isVeg", "isVeg"),
  optionalBooleanBody("isAvailable", "isAvailable"),
  body("preparationTime")
    .optional()
    .isInt({ min: 0 })
    .withMessage("preparationTime must be a non-negative integer"),
];

const toggleAvailabilityValidator = [
  mongoIdParam("restaurantId"),
  mongoIdParam("itemId"),
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
  createMenuItemValidator,
  updateMenuItemValidator,
  toggleAvailabilityValidator,
};
