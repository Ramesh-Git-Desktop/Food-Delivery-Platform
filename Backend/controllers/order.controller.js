const mongoose = require("mongoose");
const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const Coupon = require("../models/Coupon.js");
const User = require("../models/User.js");
const Rider = require("../models/Rider.js");
const { ORDER_DEFAULTS } = require("../config/constants.js");
const { createNotification } = require("../services/notification.service");
const { auditLog } = require("../services/audit.service");
const { OrderService } = require("../services/order.service");
const { isValidObjectId } = require("../utils/objectId");
const logger = require("../utils/logger");

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : value;

const hasNonEmptyValue = (value) =>
  typeof value === "string" ? value.trim().length > 0 : value !== undefined && value !== null;

const isValidIndianPhone = (value) => /^[6-9]\d{9}$/.test(String(value || "").trim());

const isValidIndianPincode = (value) => /^\d{6}$/.test(String(value || "").trim());

const pickFirstValue = (...values) => values.find((value) => hasNonEmptyValue(value));

const buildOrderAddressSnapshot = (address) => ({
  fullName: normalizeText(pickFirstValue(address.fullName, address.name)) || null,
  phone: normalizeText(pickFirstValue(address.phone, address.mobile)) || null,
  addressLine1: normalizeText(
    pickFirstValue(address.addressLine1, address.street, address.address, address.line1)
  ) || null,
  addressLine2: normalizeText(
    pickFirstValue(address.addressLine2, address.line2)
  ) || null,
  landmark: normalizeText(pickFirstValue(address.landmark)) || null,
  city: normalizeText(pickFirstValue(address.city, address.town)) || null,
  state: normalizeText(pickFirstValue(address.state)) || null,
  pincode: normalizeText(
    pickFirstValue(address.pincode, address.pinCode, address.zipCode, address.postalCode)
  ) || null,
  country: normalizeText(pickFirstValue(address.country)) || null,
  addressType: normalizeText(
    pickFirstValue(address.addressType, address.label, address.type)
  ) || null,
});

const validateOrderAddressSnapshot = (addressSnapshot) => {
  const requiredFields = ["phone", "addressLine1", "city", "state", "pincode"];
  const missingFields = requiredFields.filter(
    (field) => !hasNonEmptyValue(addressSnapshot[field])
  );

  if (missingFields.length > 0) {
    return `Selected address is incomplete. Missing: ${missingFields.join(", ")}`;
  }

  if (!isValidIndianPhone(addressSnapshot.phone)) {
    return "Selected address must include a valid 10-digit Indian phone number";
  }

  if (!isValidIndianPincode(addressSnapshot.pincode)) {
    return "Selected address must include a valid 6-digit pincode";
  }

  return null;
};

const calculateCouponDiscount = (coupon, itemsTotal) => {
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (itemsTotal * Number(coupon.discountValue || 0)) / 100;

    if (Number(coupon.maxDiscount) > 0 && discount > Number(coupon.maxDiscount)) {
      discount = Number(coupon.maxDiscount);
    }
  } else {
    discount = Number(coupon.discountValue) || 0;
  }

  if (!Number.isFinite(discount) || discount < 0) {
    return 0;
  }

  return Math.min(discount, itemsTotal);
};

const validateAndPrepareCoupon = async ({ couponCode, itemsTotal, userId }) => {
  const normalizedCouponCode =
    typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";

  if (!normalizedCouponCode) {
    return { coupon: null, discount: 0 };
  }

  const coupon = await Coupon.findOne({
    code: normalizedCouponCode,
    isActive: true,
  });

  if (!coupon) {
    return {
      status: 400,
      message: "Invalid or inactive coupon code",
    };
  }

  const now = new Date();

  if (coupon.validFrom && now < coupon.validFrom) {
    return {
      status: 400,
      message: "Coupon is not active yet",
    };
  }

  if (coupon.validUntil && now > coupon.validUntil) {
    return {
      status: 400,
      message: "Coupon has expired ",
    };
  }

  const minOrderValue = Number(coupon.minOrderValue) || 0;
  if (itemsTotal < minOrderValue) {
    return {
      status: 400,
      message: `Coupon requires a minimum order value of ${minOrderValue}`,
    };
  }

  const usageLimit = Number(coupon.usageLimit) || 0;
  const usedCount = Number(coupon.usedCount) || 0;
  if (usageLimit > 0 && usedCount >= usageLimit) {
    return {
      status: 400,
      message: "Sorry! Coupon usage limit has been reached",
    };
  }

  if (coupon.usedBy?.some((id) => String(id) === String(userId))) {
    return {
      status: 400,
      message: "You have already used this coupon",
    };
  }

  const discount = calculateCouponDiscount(coupon, itemsTotal);

  if (discount <= 0) {
    return {
      status: 400,
      message: "Coupon is not applicable to this order  only provides a discount of 0",
    };
  }

  return {
    coupon,
    discount,
  };
};


const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId, paymentMethod, couponCode, instructions } = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "addressId is required to place an order",
      });
    }

    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid addressId",
      });
    }

    const user = await User.findById(userId).select("addresses").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found while placing order",
      });
    }

    const selectedAddress = Array.isArray(user.addresses)
      ? user.addresses.find((address) => String(address._id) === String(addressId))
      : null;

    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: "Selected address not found while placing order",
      });
    }

    const addressSnapshot = buildOrderAddressSnapshot(selectedAddress);
    const addressValidationError = validateOrderAddressSnapshot(addressSnapshot);

    if (addressValidationError) {
      return res.status(400).json({
        success: false,
        message: addressValidationError,
      });
    }

    // Validate cart
    const cart = await Cart.findOne({ user: userId }).populate("items.item");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    let itemsTotal = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const menuItemId = cartItem.item?._id || cartItem.item;
      const itemName = cartItem.item?.name || cartItem.name;
      const rawPrice = cartItem.item?.price ?? cartItem.price;
      const price = Number(rawPrice);
      const quantity = Number(cartItem.quantity);

      // Quantity Validation and Price Validation
      if (!menuItemId || !Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item data. Please refresh cart and try again.",
        });
      }

      const total = price * quantity;
      itemsTotal += total;

      orderItems.push({
        menuItem: menuItemId,
        name: itemName,
        price,
         quantity,
        total,
      });
    }

    const deliveryFee = ORDER_DEFAULTS.deliveryFee;
    const tax = itemsTotal * ORDER_DEFAULTS.taxRate;
    let discount = 0;
    let appliedCoupon = null;

    
    if (couponCode) {
      const couponResult = await validateAndPrepareCoupon({
        couponCode,
        itemsTotal,
        userId,
      });

      if (couponResult.message) {
        return res.status(couponResult.status).json({
          success: false,
          message: couponResult.message,
        });
      }

      appliedCoupon = couponResult.coupon;
      discount = couponResult.discount;
    }
    // Ensure all pricing values are valid numbers before calculating grand total
    const grandTotal = itemsTotal + deliveryFee + tax - discount;

    if (!Number.isFinite(grandTotal)) {
      return res.status(400).json({
        success: false,
        message: "Unable to place order due to invalid pricing values.",
      });
    }

    const session = await mongoose.startSession();
    let order;

    try {
      await session.withTransaction(async () => {
        order = await Order.create(
          [{
            user: userId,
            restaurant: cart.restaurant,
            items: orderItems,
            address: addressSnapshot,
            addressId: String(selectedAddress._id),
            coupon: appliedCoupon ? appliedCoupon._id : null,
            paymentMethod,
            instructions,
            pricing: {
              itemsTotal,
              deliveryFee,
              tax,
              discount,
              grandTotal,
            },
          }],
          { session }
        ).then((created) => created[0]);

        await clearUserCart(userId, session);

        if (appliedCoupon) {
          await Coupon.findByIdAndUpdate(
            appliedCoupon._id,
            {
              $inc: { usedCount: 1 },
              $addToSet: { usedBy: userId },
            },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }

    await auditLog({
      req,
      action: "ORDER_CREATED",
      entity: {
        _id: order._id,
        model: "Order",
        label: order.orderNumber,
      },
      description: "Order placed successfully",
      metadata: {
        restaurantId: order.restaurant,
        userId: order.user,
        couponId: order.coupon,
        paymentMethod: order.paymentMethod,
        pricing: order.pricing,
        itemCount: order.items.length,
      },
    });

    await createNotification(
      order.restaurant,
      "restaurant-admin",
      "New Order",
      "A new order has been placed"
    );

    return sendOrderResponse(res, order);
  } catch (error) {
    logger.error("Create Order Error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || req.user?._id,
    });

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


/* ---------------------------------------------------
   Utility Function : Clear Cart
--------------------------------------------------- */
const clearUserCart = async (userId, session = null) => {
  const cart = await Cart.findOne({ user: userId }).session(session);

  if (cart) {
    cart.items = [];
    await cart.save({ session });
  }
};


/* ---------------------------------------------------
   Utility Function : Send Response
--------------------------------------------------- */
const sendOrderResponse = (res, order) => {
  return res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
};


/* ---------------------------------------------------
   Get My Orders
--------------------------------------------------- */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || ORDER_DEFAULTS.pageLimit;
    const status = req.query.status;

    const skip = (page - 1) * limit;

    const filter = { user: userId };

    if (status) {
      filter.status = status;
    }

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("restaurant", "name")
      .populate("rider", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      data: orders,
    });
  } catch (error) {
    logger.error("Get My Orders Error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || req.user?._id,
    });

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your orders",
    });
  }
};


/* ---------------------------------------------------
   Get Single Order
--------------------------------------------------- */
const getSingleOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .populate("restaurant", "name address phone")
      .populate("rider", "name phone")
      .populate("items.menuItem", "name image price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error("Get Single Order Error", {
      error: error.message,
      stack: error.stack,
      orderId: req.params?.orderId,
      userId: req.user?.id || req.user?._id,
    });

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the order details",
    });
  }
};


/* ---------------------------------------------------
   Cancel Order
--------------------------------------------------- */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId"
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (req.user?.role === "user" && String(order.user) !== String(req.user.id || req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can cancel only your own orders"
      });
    }

    if (req.user?.role === "rider" && String(order.rider) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can cancel only orders assigned to you"
      });
    }

    const cancelledBy =
      req.user?.role === "user" ? "USER" : req.user?.role === "rider" ? "RIDER" : null;

    try {
      OrderService.updateStatus(order, "CANCELLED", {
        cancelledBy,
        cancellationReason: req.body?.cancellationReason,
      });
    } catch (statusError) {
      return res.status(400).json({
        success: false,
        message: statusError.message,
      });
    }

    await order.save();

    await auditLog({
      req,
      action: "ORDER_CANCELLED",
      entity: {
        _id: order._id,
        model: "Order",
        label: order.orderNumber,
      },
      description: "Order cancelled",
      metadata: {
        status: order.status,
        cancelledBy: order.cancelledBy,
        riderId: order.rider,
        restaurantId: order.restaurant,
        userId: order.user,
      },
    });

    await createNotification(
      order.user,
      "user",
      "Order Cancelled",
      "Your order has been cancelled"
    );

    await createNotification(
      order.restaurant,
      "restaurant-admin",
      "Order Cancelled",
      "An order has been cancelled"
    );

    if (order.rider) {
      await createNotification(
        order.rider,
        "rider",
        "Order Cancelled",
        "The delivery order has been cancelled"
      );
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ---------------------------------------------------
   Update Order Status
--------------------------------------------------- */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Order status is required"
      });
    }

    let nextStatus;
    try {
      nextStatus = OrderService.assertValidStatus(status);
    } catch (statusError) {
      return res.status(400).json({
        success: false,
        message: statusError.message
      });
    }

    const previousStatus = order.status;

    try {
      OrderService.updateStatus(order, nextStatus);
    } catch (statusError) {
      return res.status(400).json({
        success: false,
        message: statusError.message
      });
    }

    await order.save();

    await auditLog({
      req,
      action: "ORDER_STATUS_UPDATED",
      entity: {
        _id: order._id,
        model: "Order",
        label: order.orderNumber,
      },
      description: "Order status updated",
      metadata: {
        previousStatus,
        newStatus: order.status,
        riderId: order.rider,
        restaurantId: order.restaurant,
        userId: order.user,
      },
    });

    if (order.status === "PREPARED") {
      const riders = await Rider.find({ status: "available" });

      for (const rider of riders) {
        await createNotification(
          rider._id,
          "rider",
          "Order Ready for Pickup",
          `Order #${order._id} is ready for pickup`
        );
      }
    }

    if (order.status === "CONFIRMED") {
      await createNotification(
        order.user,
        "user",
        "Order Accepted",
        "Your order has been accepted by the restaurant"
      );
    }

    if (order.status === "PICKED_UP") {
      await createNotification(
        order.user,
        "user",
        "Order Picked Up",
        "Your order has been picked up by the rider"
      );
    }

    if (order.status === "DELIVERED") {
      await createNotification(
        order.user,
        "user",
        "Order Delivered",
        "Your order has been delivered"
      );

      await createNotification(
        order.restaurant,
        "restaurant-admin",
        "Order Delivered",
        "An order has been delivered"
      );
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  updateOrderStatus
};
