
const mongoose = require("mongoose");
const crypto = require("crypto");

const generateOrderNumber = () => {
  const datePart = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
};
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: String, // snapshot (important)
    price: Number, // snapshot price
    quantity: {
      type: Number,
      required: true,
    },
    total: Number,
  },
  { _id: false }
);

const orderAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "",
      trim: true,
    },
    addressType: {
      type: String,
      default: "home",
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      default: generateOrderNumber,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },

    items: [orderItemSchema],

    address: {
      type: orderAddressSchema,
      required: true,
    },

    addressId: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    pricing: {
      itemsTotal: Number,
      deliveryFee: Number,
      tax: Number,
      discount: Number,
      grandTotal: Number,
    },

    status: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PREPARING",
        "PREPARED",
        "PICKED_UP",
        "ON_THE_WAY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    instructions: {
      type: String,
    },

    cancellationReason: {
      type: String,
      default: null,
    },

    cancelledBy: {
      type: String,
      enum: ["USER", "RESTAURANT", "ADMIN", "RIDER"],
      default: null,
    },

    estimatedDeliveryTime: Date,

    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
orderSchema.index({ rider: 1, status: 1, createdAt: -1 });
orderSchema.index({ rider: 1, deliveredAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
