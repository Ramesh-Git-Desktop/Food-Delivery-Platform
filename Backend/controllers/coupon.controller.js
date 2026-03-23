const asyncHandler = require("express-async-handler");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");
const { auditLog } = require("../services/audit.service");
const { assertValidObjectId } = require("../utils/objectId");

// ================= CREATE COUPON =================
exports.createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscount,
    validFrom,
    validUntil,
    usageLimit
  } = req.body;

  if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
    res.status(400);
    throw new Error("Required fields are missing");
  }

  const existingCoupon = await Coupon.findOne({
    code: code.toUpperCase()
  });

  if (existingCoupon) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderValue: minOrderValue || 0,
    maxDiscount: maxDiscount || 0,
    validFrom,
    validUntil,
    usageLimit: usageLimit || 1
  });

  await coupon.save();
  await auditLog({
    req,
    action: "COUPON_CREATED",
    entity: {
      _id: coupon._id,
      model: "Coupon",
      label: coupon.code
    },
    description: "Coupon created",
    metadata: {
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil
    }
  });

  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    data: coupon
  });
});

// ================= GET ALL COUPONS =================
exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();

  res.json({
    success: true,
    data: coupons
  });
});

// ================= UPDATE COUPON =================
exports.updateCoupon = asyncHandler(async (req, res) => {
  const couponId = assertValidObjectId(req.params.id, "couponId");
  const allowedFields = [
    "code",
    "discountType",
    "discountValue",
    "minOrderValue",
    "maxDiscount",
    "validFrom",
    "validUntil",
    "usageLimit",
    "isActive"
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
  }

  const existingCoupon = await Coupon.findById(couponId);

  if (!existingCoupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    updateData,
    {
      returnDocument: "after",
      runValidators: true
    }
  );

  await auditLog({
    req,
    action: "COUPON_UPDATED",
    entity: {
      _id: coupon._id,
      model: "Coupon",
      label: coupon.code
    },
    description: "Coupon updated",
    metadata: {
      updatedFields: Object.keys(updateData),
      before: {
        code: existingCoupon.code,
        discountType: existingCoupon.discountType,
        discountValue: existingCoupon.discountValue,
        usageLimit: existingCoupon.usageLimit,
        isActive: existingCoupon.isActive
      },
      after: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive
      }
    }
  });

  res.json({
    success: true,
    data: coupon
  });
});

// ================= DELETE COUPON =================
exports.deleteCoupon = asyncHandler(async (req, res) => {
  const couponId = assertValidObjectId(req.params.id, "couponId");
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  await auditLog({
    req,
    action: "COUPON_DELETED",
    entity: {
      _id: coupon._id,
      model: "Coupon",
      label: coupon.code
    },
    description: "Coupon deleted",
    metadata: {
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount
    }
  });

  await coupon.deleteOne();

  res.json({
    success: true,
    message: "Coupon deleted"
  });
});

// ================= APPLY COUPON =================
exports.applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartId } = req.body;

  if (!code || !cartId) {
    res.status(400);
    throw new Error("code and cartId are required");
  }

  const normalizedCartId = assertValidObjectId(cartId, "cartId");

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    res.status(404);
    throw new Error("Invalid coupon");
  }

  const now = new Date();

  if (now < coupon.validFrom || now > coupon.validUntil) {
    res.status(400);
    throw new Error("Coupon expired or not active yet");
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error("Coupon usage limit reached");
  }

  const cart = await Cart.findById(normalizedCartId);

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  if (coupon.usedBy.some((u) => u.toString() === cart.user.toString())) {
    res.status(400);
    throw new Error("You already used this coupon");
  }

  let cartTotal = 0;

  cart.items.forEach((item) => {
    cartTotal += item.price * item.quantity;
  });

  if (cartTotal < coupon.minOrderValue) {
    res.status(400);
    throw new Error(
      `Minimum order value should be ${coupon.minOrderValue}`
    );
  }

  const discountValue = Number(coupon.discountValue) || 0;
  const maxDiscount = Number(coupon.maxDiscount) || 0;
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (cartTotal * discountValue) / 100;

    if (maxDiscount > 0) {
      discount = Math.min(discount, maxDiscount);
    }
  }

  if (coupon.discountType === "flat") {
    discount = Math.min(discountValue, cartTotal);
  }

  if (!Number.isFinite(discount) || discount < 0) {
    discount = 0;
  }

  discount = Math.min(discount, cartTotal);

  const finalAmount = cartTotal - discount;

  cart.totalAmount = cartTotal;
  cart.discount = discount;
  cart.finalAmount = finalAmount;
  cart.appliedCoupon = coupon.code;

  await cart.save();

  res.json({
    success: true,
    cartTotal,
    discount,
    finalAmount,
    appliedCoupon: coupon.code
  });
});

// ================= AVAILABLE COUPONS =================
exports.availableCoupons = asyncHandler(async (req, res) => {
  const { cartId } = req.query;

  if (!cartId) {
    res.status(400);
    throw new Error("Cart ID is required");
  }

  const normalizedCartId = assertValidObjectId(cartId, "cartId");

  const cart = await Cart.findById(normalizedCartId);

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  let cartTotal = 0;

  cart.items.forEach((item) => {
    cartTotal += item.price * item.quantity;
  });

  const coupons = await Coupon.find({
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
    minOrderValue: { $lte: cartTotal },
    usedBy: { $ne: cart.user }
  });

  res.json({
    success: true,
    cartTotal,
    availableCoupons: coupons
  });
});
