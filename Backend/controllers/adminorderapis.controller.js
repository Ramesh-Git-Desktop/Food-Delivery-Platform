const Order = require("../models/Order");
const Rider = require("../models/Rider");
const { auditLog } = require("../services/audit.service");
const { isValidObjectId } = require("../utils/objectId");
const logger = require("../utils/logger");

exports.getAllOrders = async (req, res) => {
  try {

    // 1️⃣ Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sort = req.query.sort || "-createdAt";

    const skip = (page - 1) * limit;

    // 2️⃣ Filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    // 3️⃣ Total count
    const totalOrders = await Order.countDocuments(filter);

    // 4️⃣ Fetch orders
    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("restaurant", "name")
      .populate("rider", "name phone")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // 5️⃣ Response
    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      data: orders
    });

  } catch (error) {
    logger.error("Admin Orders Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
    });

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getOrderById = async (req, res) => {
  try {

    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId"
      });
    }

    // 1️⃣ Find order by ID
    const order = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate("restaurant", "name address phone")
      .populate("rider", "name phone")
      .populate("items.menuItem", "name price image");

    // 2️⃣ Check if order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // 3️⃣ Send response
    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    logger.error("Admin Get Order Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      orderId: req.params?.orderId,
    });

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.reassignRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({
        success: false,
        message: "riderId is required"
      });
    }

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId"
      });
    }

    if (!isValidObjectId(riderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid riderId"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reassign rider for ${order.status.toLowerCase()} order`
      });
    }

    const rider = await Rider.findById(riderId).select("name phone status isAvailable");

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    await rider.refreshSuspensionStatus();

    if (rider.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved riders can be assigned"
      });
    }

    if (!rider.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Only available riders can be assig"
      });
    }

    const previousRiderId = order.rider;
    order.rider = rider._id;
    await order.save();

    await auditLog({
      req,
      action: "ORDER_RIDER_REASSIGNED",
      entity: {
        _id: order._id,
        model: "Order",
        label: order.orderNumber
      },
      description: "Order rider reassigned by admin",
      metadata: {
        previousRiderId,
        newRiderId: rider._id,
        riderName: rider.name,
        orderStatus: order.status,
        restaurantId: order.restaurant,
        userId: order.user
      }
    });

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate("restaurant", "name address phone")
      .populate("rider", "name phone status ")
      .populate("items.menuItem", "name price image");

    res.status(200).json({
      success: true,
      message: "Rider reassigned successfully",
      data: updatedOrder
    });

  } catch (error) {
    logger.error("Admin Reassign Rider Error", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?._id,
      orderId: req.params?.orderId,
      riderId: req.body?.riderId,
    });

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
