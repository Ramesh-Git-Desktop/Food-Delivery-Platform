const rateLimit = require("express-rate-limit");
const { RATE_LIMITS, OTP_EXPIRY_MINUTES } = require("../config/constants");

const createJsonRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const loginLimiter = createJsonRateLimiter({
  windowMs: RATE_LIMITS.login.windowMs,
  max: RATE_LIMITS.login.max,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

const registerLimiter = createJsonRateLimiter({
  windowMs: RATE_LIMITS.register.windowMs,
  max: RATE_LIMITS.register.max,
  message: "Too many registrations. Try again later.",
});

const otpLimiter = createJsonRateLimiter({
  windowMs: RATE_LIMITS.otp.windowMs,
  max: RATE_LIMITS.otp.max,
  message: `Too many OTP requests. Please try again after ${OTP_EXPIRY_MINUTES} minutes.`,
});

const forgotPasswordLimiter = createJsonRateLimiter({
  windowMs: RATE_LIMITS.forgotPassword.windowMs,
  max: RATE_LIMITS.forgotPassword.max,
  message: "Too many password reset requests. Please try again later.",
});

const reviewSubmissionLimiter = createJsonRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many review submissions. Please try again later.",
});

const addressCreationLimiter = createJsonRateLimiter({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: "Too many address creation requests. Please try again later.",
});

module.exports = {
  loginLimiter,
  registerLimiter,
  otpLimiter,
  forgotPasswordLimiter,
  reviewSubmissionLimiter,
  addressCreationLimiter,
};
