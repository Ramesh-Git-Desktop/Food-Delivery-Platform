const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { markNotificationAsReadValidator } = require("../validators/notification.validator");

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *
 * /api/notifications:
 *   get:
 *     summary: Get notifications for logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched
 *
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification updated
 */


// Get all notifications
router.get(
  "/",
  protect,
  notificationController.getNotifications
);


// Mark notification as read
router.put(
  "/:id/read",
  protect,
  markNotificationAsReadValidator,
  validate,
  notificationController.markAsRead
);


// Mark all notifications as read
router.put(
  "/read-all",
  protect,
  validate,
  notificationController.markAllAsRead
);


// Delete notification
router.delete(
  "/:id",
  protect,
  notificationController.deleteNotification
);

module.exports = router;
