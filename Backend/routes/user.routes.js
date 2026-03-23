const express = require("express");
const router = express.Router();

const {
  registerUser,
  resendVerificationOTP,
  verifyEmail,
  loginUser,
  logoutUser,
  getProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateProfile,
  changePassword,
  exportUserData,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/user.controller.js");

const {
  loginLimiter,
  registerLimiter,
  otpLimiter,
  forgotPasswordLimiter,
  addressCreationLimiter
} = require("../middlewares/rateLimiter");

const { protect } = require("../middlewares/auth.middleware.js");
const { validate } = require("../middlewares/validate.middleware");
const {
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
} = require("../validators/user.validator");

/**
 * @swagger
 * tags:
 *   - name: User Auth
 *   - name: User Profile
 *
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User Auth]
 *     responses:
 *       201:
 *         description: User registered and temp token returned
 *
 * /api/user/login:
 *   post:
 *     summary: Login user
 *     tags: [User Auth]
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /api/user/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 *   put:
 *     summary: Update user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * /api/user/export-data:
 *   get:
 *     summary: Export user data for GDPR compliance (CSV or PDF)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *           default: csv
 *     responses:
 *       200:
 *         description: Export file generated
 */


// ───────────── Public Routes ─────────────

// Register new user
router.post("/register", registerLimiter, registerUserValidator, validate, registerUser);

// Resend email verification OTP
router.post("/resend-otp", otpLimiter, resendVerificationOtpValidator, validate, resendVerificationOTP);

// Verify email OTP
router.post("/verify-email", otpLimiter, verifyEmailValidator, validate, verifyEmail);

// Login user
router.post("/login", loginLimiter, loginUserValidator, validate, loginUser);

// Forgot password (send reset OTP)
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordValidator, validate, forgotPassword);

// Verify password reset OTP
router.post("/verify-reset-otp", otpLimiter, verifyResetOtpValidator, validate, verifyResetOTP);

// Reset password
router.post("/reset-password", otpLimiter, resetPasswordValidator, validate, resetPassword);


// ───────────── Protected Routes ─────────────

// Logout user
router.post("/logout", protect, validate, logoutUser);

// Get user profile
router.get("/profile", protect, getProfile);

// Update profile
router.put("/profile", protect, updateProfileValidator, validate, updateProfile);

// Change password
router.put("/change-password", protect, changePassword);
router.get("/export-data", protect, exportUserData);

// Address book
router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, addressCreationLimiter, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.post("/addresses", protect, addAddressValidator, validate, addAddress);
router.put("/addresses/:addressId", protect, updateAddressValidator, validate, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.put("/addresses/:addressId/default", protect, setDefaultAddressValidator, validate, setDefaultAddress);


// Export router
module.exports = router;
