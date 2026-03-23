const { body } = require("express-validator");
const {
  mongoIdParam,
  requiredStringBody,
  optionalStringBody,
  requiredEmailBody,
  requiredPasswordBody,
  requiredPhoneBody,
  optionalPhoneBody,
  optionalBooleanBody,
  bodyRequiresAtLeastOne,
} = require("./common.validator");

const ADDRESS_TYPE_VALUES = ["home", "work", "other"];

const validateAddressType = body("addressType")
  .optional()
  .customSanitizer((value, { req }) => value || req.body?.level || req.body?.label || req.body?.type)
  .custom((value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return true;
    }

    if (!ADDRESS_TYPE_VALUES.includes(String(value).trim().toLowerCase())) {
      throw new Error("addressType must be home, work or other");
    }

    return true;
  });

const registerUserValidator = [
  requiredStringBody("name", "Name")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  requiredEmailBody(),
  optionalPhoneBody(),
  requiredPasswordBody("password", 6),
];

const resendVerificationOtpValidator = [
  requiredStringBody("tempToken", "tempToken"),
];

const verifyEmailValidator = [
  requiredStringBody("otp", "OTP"),
  requiredStringBody("tempToken", "tempToken"),
];

const loginUserValidator = [
  requiredEmailBody(),
  requiredPasswordBody("password", 1),
];

const forgotPasswordValidator = [
  requiredEmailBody(),
];

const verifyResetOtpValidator = [
  requiredStringBody("otp", "OTP"),
  requiredStringBody("tempToken", "tempToken"),
];

const resetPasswordValidator = [
  requiredStringBody("resetToken", "resetToken"),
  requiredPasswordBody("newPassword", 6),
];

const updateProfileValidator = [
  bodyRequiresAtLeastOne(["name", "phone"], "At least one of name or phone is required"),
  optionalStringBody("name", "Name")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  optionalPhoneBody(),
];

const changePasswordValidator = [
  requiredPasswordBody("currentPassword", 1),
  requiredPasswordBody("newPassword", 6),
];

const addAddressValidator = [
  body().custom((_, { req }) => {
    if (!req.body?.fullName && !req.body?.name) {
      throw new Error("fullName or name is required");
    }
    return true;
  }),
  requiredPhoneBody(),
  body().custom((_, { req }) => {
    if (!req.body?.addressLine1 && !req.body?.address && !req.body?.street) {
      throw new Error("addressLine1, address or street is required");
    }
    return true;
  }),
  body().custom((_, { req }) => {
    if (!req.body?.city && !req.body?.town) {
      throw new Error("city or town is required");
    }
    return true;
  }),
  requiredStringBody("state", "State"),
  body().custom((_, { req }) => {
    if (!req.body?.pincode && !req.body?.pinCode && !req.body?.zipCode) {
      throw new Error("pincode, pinCode or zipCode is required");
    }
    return true;
  }),
  validateAddressType,
  optionalStringBody("country", "Country"),
  optionalBooleanBody("isDefault", "isDefault"),
];

const updateAddressValidator = [
  mongoIdParam("addressId"),
  bodyRequiresAtLeastOne(
    [
      "fullName",
      "name",
      "phone",
      "street",
      "addressLine1",
      "city",
      "town",
      "state",
      "zipCode",
      "pincode",
      "isDefault",
    ],
    "At least one address field is required"
  ),
  optionalStringBody("fullName", "fullName"),
  optionalStringBody("name", "name"),
  optionalPhoneBody(),
  optionalStringBody("street", "street"),
  optionalStringBody("addressLine1", "addressLine1"),
  optionalStringBody("city", "city"),
  optionalStringBody("town", "town"),
  optionalStringBody("state", "state"),
  optionalStringBody("zipCode", "zipCode"),
  optionalStringBody("pincode", "pincode"),
  optionalBooleanBody("isDefault", "isDefault"),
];

const setDefaultAddressValidator = [
  mongoIdParam("addressId"),
];

module.exports = {
  registerUserValidator,
  resendVerificationOtpValidator,
  verifyEmailValidator,
  loginUserValidator,
  forgotPasswordValidator,
  verifyResetOtpValidator,
  resetPasswordValidator,
  updateProfileValidator,
  changePasswordValidator,
  addAddressValidator,
  updateAddressValidator,
  setDefaultAddressValidator,
};
