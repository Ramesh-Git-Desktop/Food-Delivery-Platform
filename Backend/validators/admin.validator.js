const { body } = require("express-validator");
const {
  mongoIdParam,
  requiredStringBody,
  optionalStringBody,
  requiredEmailBody,
  optionalEmailBody,
  requiredPasswordBody,
} = require("./common.validator");

const adminLoginValidator = [
  requiredEmailBody(),
  requiredPasswordBody("password", 1),
];

const adminUpdateProfileValidator = [
  optionalStringBody("name", "Name"),
  optionalEmailBody(),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const restaurantAdminActionValidator = [
  mongoIdParam("id"),
];

const rejectRestaurantValidator = [
  mongoIdParam("id"),
  requiredStringBody("reason", "reason"),
];

const riderAdminActionValidator = [
  mongoIdParam("id"),
];

const rejectRiderValidator = [
  mongoIdParam("id"),
  requiredStringBody("reason", "reason"),
];

const suspendRiderValidator = [
  mongoIdParam("id"),
  body("durationDays")
    .optional()
    .isInt({ min: 1 })
    .withMessage("durationDays must be a positive integer"),
  optionalStringBody("reason", "reason"),
];

const userActionValidator = [
  mongoIdParam("id"),
];

module.exports = {
  adminLoginValidator,
  adminUpdateProfileValidator,
  restaurantAdminActionValidator,
  rejectRestaurantValidator,
  riderAdminActionValidator,
  rejectRiderValidator,
  suspendRiderValidator,
  userActionValidator,
};
