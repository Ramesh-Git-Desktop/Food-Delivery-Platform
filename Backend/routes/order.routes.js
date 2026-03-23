const express = require("express");
const { createOrder,getMyOrders,getSingleOrder, cancelOrder } = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createOrderValidator } = require("../validators/order.validator");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *
 * /api/order:
 *   post:
 *     summary: Create a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed successfully
 *   get:
 *     summary: Get logged-in user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched
 *
 * /api/order/{orderId}:
 *   get:
 *     summary: Get single user order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details fetched
 */

// POST /api/orders
router.post("/", protect, createOrderValidator, validate, createOrder);

// GET /api/orders
router.get("/", protect, getMyOrders);


// GET /api/orders/:orderId
router.get("/:orderId", protect, getSingleOrder);
router.patch("/:orderId/cancel", protect, cancelOrder);
module.exports = router;
