const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { getAllOrders, getOrderById, reassignRider } = require("../controllers/adminorderapis.controller");
const { reassignRiderValidator } = require("../validators/adminOrder.validator");

/**
 * @swagger
 * tags:
 *   - name: Admin Orders
 *
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (main-admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched
 */

router.get("/", protect, authorize("main-admin"), getAllOrders);
router.get("/:orderId", protect, authorize("main-admin"), getOrderById);
router.put("/:orderId/reassign", protect, authorize("main-admin"), reassignRiderValidator, validate, reassignRider);

module.exports = router;
