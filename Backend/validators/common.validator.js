const { body, param } = require("express-validator");

const BOOLEAN_LIKE_VALUES = ["true", "false", "1", "0", "yes", "no", "on", "off"];
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

const hasNonEmptyValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const isBooleanLike = (value) =>
  typeof value === "boolean" || BOOLEAN_LIKE_VALUES.includes(String(value).trim().toLowerCase());

const mongoIdParam = (field) =>
  param(field)
    .isMongoId()
    .withMessage(`${field} must be a valid MongoDB ObjectId`);

const mongoIdBody = (field, label = field) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} is required`)
    .isMongoId()
    .withMessage(`${label} must be a valid MongoDB ObjectId`);

const requiredStringBody = (field, label = field) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`);

const optionalStringBody = (field, label = field) =>
  body(field)
    .optional()
    .isString()
    .withMessage(`${label} must be a string`)
    .trim();

const requiredEmailBody = (field = "email") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email");

const optionalEmailBody = (field = "email") =>
  body(field)
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email");

const requiredPasswordBody = (field = "password", minLength = 6) =>
  body(field)
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: minLength })
    .withMessage(`Password must be at least ${minLength} characters`);

const requiredPhoneBody = (field = "phone", label = "Phone number") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .matches(PHONE_REGEX)
    .withMessage(`${label} must be a valid phone number`);

const optionalPhoneBody = (field = "phone", label = "Phone number") =>
  body(field)
    .optional()
    .trim()
    .matches(PHONE_REGEX)
    .withMessage(`${label} must be a valid phone number`);

const optionalBooleanBody = (field, label = field) =>
  body(field)
    .optional()
    .custom((value) => {
      if (!isBooleanLike(value)) {
        throw new Error(`${label} must be a boolean`);
      }
      return true;
    });

const bodyRequiresAtLeastOne = (fields, message) =>
  body().custom((_, { req }) => {
    const hasValue = fields.some((field) => hasNonEmptyValue(req.body?.[field]));

    if (!hasValue) {
      throw new Error(message);
    }

    return true;
  });

module.exports = {
  mongoIdParam,
  mongoIdBody,
  requiredStringBody,
  optionalStringBody,
  requiredEmailBody,
  optionalEmailBody,
  requiredPasswordBody,
  requiredPhoneBody,
  optionalPhoneBody,
  optionalBooleanBody,
  bodyRequiresAtLeastOne,
};
