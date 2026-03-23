const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const { auditLog } = require("../services/audit.service");
const { isValidObjectId } = require("../utils/objectId");
const logger = require("../utils/logger");

const getAuthorizedRestaurant = async (req, res) => {
  const requesterId = req.user?._id;

  if (!requesterId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return null;
  }

  const restaurant = await Restaurant.findOne({ admin: requesterId });

  if (!restaurant) {
    res.status(403).json({
      success: false,
      message: "You are not authorized to manage this restaurant",
    });
    return null;
  }

  const ownerId = restaurant.owner || restaurant.admin;
  if (!ownerId || String(ownerId) !== String(requesterId)) {
    res.status(403).json({
      success: false,
      message: "You are not authorized to manage this restaurant",
    });
    return null;
  }

  return restaurant;
};

exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await getAuthorizedRestaurant(req, res);
    if (!restaurant) return;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { restaurant: restaurant._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const totalOrders = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      data: orders,
    });
  } catch (error) {
    logger.error("Restaurant Orders Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getRestaurantOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId",
      });
    }

    const restaurant = await getAuthorizedRestaurant(req, res);
    if (!restaurant) return;

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    })
      .populate("user", "name email phone")
      .populate("items.menuItem", "name price image")
      .populate("rider", "name phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this restaurant",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error("Get Restaurant Order Details Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      orderId: req.params?.orderId,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId",
      });
    }

    const restaurant = await getAuthorizedRestaurant(req, res);
    if (!restaurant) return;

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "PLACED") {
      return res.status(400).json({
        success: false,
        message: "Only placed orders can be accepted by restaurant",
      });
    }

    order.status = "CONFIRMED";
    await order.save();

    await auditLog({
      req,
      action: "ORDER_ACCEPTED_BY_RESTAURANT",
      entity: {
        _id: order._id,
        model: "Order",
        label: order.orderNumber,
      },
      description: "Restaurant accepted order",
      metadata: {
        restaurantId: restaurant._id,
        userId: order.user,
        previousStatus: "PLACED",
        newStatus: order.status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order accepted successfully and is now confirmed",
      data: order,
    });
  } catch (error) {
    logger.error("Accept Order Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      orderId: req.params?.orderId,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId",
      });
    }

    const restaurant = await getAuthorizedRestaurant(req, res);
    if (!restaurant) return;

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "PLACED") {
      return res.status(400).json({
        success: false,
        message: "Only placed orders can be rejected",
      });
    }

    order.status = "CANCELLED";
    order.cancelledBy = "RESTAURANT";
    order.cancellationReason = reason || "Rejected by restaurant";
    await order.save();

    await auditLog({
      req,
      action: "ORDER_REJECTED_BY_RESTAURANT",
      entity: {
        _id: order._id,
        model: "Order",
        label: order.orderNumber,
      },
      description: "Restaurant rejected order",
      metadata: {
        restaurantId: restaurant._id,
        userId: order.user,
        previousStatus: "PLACED",
        newStatus: order.status,
        cancellationReason: order.cancellationReason,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order rejected successfully",
      data: order,
    });
  } catch (error) {
    logger.error("Reject Order Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      orderId: req.params?.orderId,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markOrderPreparing = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId",
      });
    }

    const restaurant = await getAuthorizedRestaurant(req, res);
    if (!restaurant) return;

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Order must be confirmed before preparing",
      });
    }

    order.status = "PREPARING";
    await order.save();

    await auditLog({
      req,
      action: "ORDER_MARKED_PREPARING",
      entity: {
        _id: order._id,
        model: "Order",
        label: order.orderNumber,
      },
      description: "Restaurant marked order as preparing",
      metadata: {
        restaurantId: restaurant._id,
        userId: order.user,
        previousStatus: "CONFIRMED",
        newStatus: order.status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order is now preparing",
      data: order,
    });
  } catch (error) {
    logger.error("Preparing Order Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      orderId: req.params?.orderId,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markOrderReady = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId",
      });
    }

    const restaurant = await getAuthorizedRestaurant(req, res);
    if (!restaurant) return;

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    })
      .populate("user", "name email phone")
      .populate("rider", "name phone")
      .populate("items.menuItem", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "PREPARING") {
      return res.status(400).json({
        success: false,
        message: "Order must be preparing before marking ready",
      });
    }

    order.status = "PREPARED";
    await order.save();

    await auditLog({
      req,
      action: "ORDER_MARKED_PREPARED",
      entity: {
        _id: order._id,
        model: "Order",
        label: order.orderNumber,
      },
      description: "Restaurant marked order as prepared",
      metadata: {
        restaurantId: restaurant._id,
        userId: order.user?._id || order.user,
        riderId: order.rider?._id || order.rider,
        previousStatus: "PREPARING",
        newStatus: order.status,
      },
    });

    res.status(200).json({
      success: true,
      message: order.rider
        ? "Order is ready for pickup and rider can be notified"
        : "Order is ready for pickup",
      data: order,
    });
  } catch (error) {
    logger.error("Ready Order Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      orderId: req.params?.orderId,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
