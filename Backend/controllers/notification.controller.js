const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");
const { assertValidObjectId } = require("../utils/objectId");

exports.getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    userId: req.user._id,
    role: req.user.role,
  };

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    page,
    total,
    notifications,
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notificationId = assertValidObjectId(req.params.id, "notificationId");

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      userId: req.user._id,
      role: req.user.role,
    },
    { isRead: true },
    { returnDocument: "after" }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found or not authorized");
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      userId: req.user._id,
      role: req.user.role,
    },
    {
      $set: { isRead: true },
    }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = assertValidObjectId(req.params.id, "notificationId");

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId: req.user._id,
    role: req.user.role,
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found or not authorized");
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});
