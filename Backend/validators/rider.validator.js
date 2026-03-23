const { body } = require("express-validator");
const {
  requiredEmailBody,
  requiredPasswordBody,
  requiredPhoneBody,
  optionalPhoneBody,
  optionalStringBody,
  optionalBooleanBody,
  mongoIdParam,
} = require("./common.validator");

const registerRiderValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  requiredEmailBody(),
  requiredPasswordBody("password", 8),
  requiredPhoneBody(),
  body("vehicleType")
    .isIn(["bike", "scooter", "bicycle"])
    .withMessage("Invalid vehicle type"),
  body("vehicleNumber")
    .trim()
    .notEmpty()
    .withMessage("Vehicle number required")
];

const loginRiderValidator = [
  requiredEmailBody(),
  requiredPasswordBody("password", 1),
];

const updateRiderProfileValidator = [
  optionalStringBody("name", "Name"),
  optionalPhoneBody(),
  body("vehicleType")
    .optional()
    .isIn(["bike", "scooter", "bicycle"])
    .withMessage("Invalid vehicle type"),
  optionalStringBody("vehicleNumber", "Vehicle number"),
];

const toggleAvailabilityValidator = [
  optionalBooleanBody("isAvailable", "isAvailable"),
];

const riderOrderActionValidator = [
  mongoIdParam("orderId"),
];

module.exports = {
  registerRiderValidator,
  loginRiderValidator,
  updateRiderProfileValidator,
  toggleAvailabilityValidator,
  riderOrderActionValidator,
};
