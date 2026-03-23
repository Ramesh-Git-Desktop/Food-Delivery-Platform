const { body } = require("express-validator");
const {
  requiredEmailBody,
  requiredPasswordBody,
  requiredPhoneBody,
  optionalPhoneBody,
  optionalStringBody,
  optionalBooleanBody,
} = require("./common.validator");

const restaurantRegisterRules = [
  body("ownerName")
    .trim()
    .notEmpty()
    .withMessage("Owner name is required")
    .isLength({ min: 2 })
    .withMessage("Owner name must be at least 2 characters"),

  requiredEmailBody(),

  requiredPasswordBody("password", 6),

  requiredPhoneBody(),

  body("restaurantName")
    .trim()
    .notEmpty()
    .withMessage("Restaurant name is required"),

  body("restaurantAddress")
    .trim()
    .notEmpty()
    .withMessage("Restaurant address is required"),

  body("restaurantCity")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("restaurantPincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required"),

  body("restaurantPhone")
    .trim()
    .notEmpty()
    .withMessage("Restaurant phone is required"),

  body("openingTime")
    .trim()
    .notEmpty()
    .withMessage("Opening time is required"),

  body("closingTime")
    .trim()
    .notEmpty()
    .withMessage("Closing time is required"),
];

const restaurantLoginRules = [
  requiredEmailBody(),
  requiredPasswordBody("password", 1),
];

const restaurantUpdateProfileRules = [
  optionalStringBody("ownerName", "Owner name")
    .isLength({ min: 2 })
    .withMessage("Owner name must be at least 2 characters"),
  optionalPhoneBody(),
];

const toggleRestaurantStatusRules = [
  optionalBooleanBody("isOpen", "isOpen"),
];

module.exports = {
  restaurantRegisterRules,
  restaurantLoginRules,
  restaurantUpdateProfileRules,
  toggleRestaurantStatusRules,
};
