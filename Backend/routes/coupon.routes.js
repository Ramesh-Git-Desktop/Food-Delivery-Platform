


const express = require("express");
const router = express.Router();

const couponController = require("../controllers/coupon.controller");

const {
  protect,
  mainAdminOnly,
  userOnly
} = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createCouponValidator,
  updateCouponValidator,
  applyCouponValidator,
} = require("../validators/coupon.validator");

/**
 * @swagger
 * tags:
 *   - name: Coupons
 *
 * /api/coupons/admin:
 *   post:
 *     summary: Create coupon (main-admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Coupon created
 *   get:
 *     summary: Get all coupons (main-admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupons fetched
 *
 * /api/coupons/apply:
 *   post:
 *     summary: Apply coupon to cart (user)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon applied
 */


/* ================= ADMIN ROUTES ================= */

// Create coupon
router.post(
  "/admin",
  protect,
  mainAdminOnly,
  createCouponValidator,
  validate,
  couponController.createCoupon
);

// Get all coupons
router.get(
  "/admin",
  protect,
  mainAdminOnly,
  couponController.getAllCoupons
);

// Update coupon
router.put(
  "/admin/:id",
  protect,
  mainAdminOnly,
  updateCouponValidator,
  validate,
  couponController.updateCoupon
);

// Delete coupon
router.delete(
  "/admin/:id",
  protect,
  mainAdminOnly,
  couponController.deleteCoupon
);


/* ================= USER ROUTES ================= */

// Apply coupon
router.post(
  "/apply",
  protect,
  userOnly,
  applyCouponValidator,
  validate,
  couponController.applyCoupon
);

// Get available coupons
router.get(
  "/available",
  protect,
  userOnly,
  couponController.availableCoupons
);

module.exports = router;
