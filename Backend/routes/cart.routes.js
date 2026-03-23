
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

const {
  addToCartValidation,
  updateCartValidation,
  removeCartValidation
} = require("../validators/cart.validator");

/**
 * @swagger
 * tags:
 *   - name: Cart
 *
 * /api/cart:
 *   get:
 *     summary: Get current user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched
 *
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart updated
 */


// Add item
router.post("/add", protect, addToCartValidation, cartController.addToCart);

// Get cart
router.get("/", protect, cartController.getCart);

// Update item
router.put("/item/:itemId", protect, updateCartValidation, cartController.updateCartItem);

// Remove item
router.delete("/item/:itemId", protect, removeCartValidation, cartController.removeCartItem);

// Clear cart
router.delete("/clear", protect, cartController.clearCart);

module.exports = router;
