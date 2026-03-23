const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  checkStatus,
  getDashboardStats,
  getRevenueChart,
  getPopularItems,
  toggleRestaurantStatus
} = require("../controllers/restaurantAdmin.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { uploadFields } = require("../middlewares/upload.middleware");
const {
  RESTAURANT_REGISTRATION_UPLOAD_LIMITS,
} = require("../config/constants");
const {
  restaurantRegisterRules,
  restaurantLoginRules,
  restaurantUpdateProfileRules,
  toggleRestaurantStatusRules,
} = require("../validators/restaurantAdmin.validator");
const { validate } = require("../middlewares/validate.middleware");

/**
 * @swagger
 * tags:
 *   - name: Restaurant Admin
 *
 * /api/restaurant-admin/register:
 *   post:
 *     summary: Register restaurant admin application
 *     tags: [Restaurant Admin]
 *     responses:
 *       201:
 *         description: Registration submitted
 *
 * /api/restaurant-admin/login:
 *   post:
 *     summary: Login restaurant admin
 *     tags: [Restaurant Admin]
 *     responses:
 *       200:
 *         description: Login successful
 */

// File upload fields for restaurant registration
const registerUpload = uploadFields([
  {
    name: "restaurantLogo",
    maxCount: RESTAURANT_REGISTRATION_UPLOAD_LIMITS.restaurantLogo,
  },
  {
    name: "restaurantImages",
    maxCount: RESTAURANT_REGISTRATION_UPLOAD_LIMITS.restaurantImages,
  },
  {
    name: "fssaiLicense",
    maxCount: RESTAURANT_REGISTRATION_UPLOAD_LIMITS.fssaiLicense,
  },
  {
    name: "gstCertificate",
    maxCount: RESTAURANT_REGISTRATION_UPLOAD_LIMITS.gstCertificate,
  },
  {
    name: "panCard",
    maxCount: RESTAURANT_REGISTRATION_UPLOAD_LIMITS.panCard,
  },
]);

// ----- Restaurant Admin Auth -----
router.post("/register", registerUpload, restaurantRegisterRules, validate, register);
router.post("/login", restaurantLoginRules, validate, login);
router.post("/logout", protect, authorize("restaurant-admin"), validate, logout);
router.get("/profile", protect, authorize("restaurant-admin"), getProfile);
router.put("/profile", protect, authorize("restaurant-admin"), restaurantUpdateProfileRules, validate, updateProfile);
router.get("/status", checkStatus);
router.get("/dashboard/stats", protect, authorize("restaurant-admin"), getDashboardStats);
router.get("/dashboard/revenue", protect, authorize("restaurant-admin"), getRevenueChart);
router.get("/dashboard/popular-items", protect, authorize("restaurant-admin"), getPopularItems);
router.put("/restaurant/toggle-status", protect, authorize("restaurant-admin"), toggleRestaurantStatusRules, validate, toggleRestaurantStatus);

module.exports = router;
