
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
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

    items: [cartItemSchema],

    totalAmount: {
      type: Number,
      default: 0,
    },

    // ⭐ Add coupon related fields here

    discount: {
      type: Number,
      default: 0
    },

    finalAmount: {
      type: Number,
      default: 0
    },

    appliedCoupon: {
      type: String,
      default: null
    }

  },
  { timestamps: true }
);
/* ================= INDEXES ================= */
// Fast lookup for user's cart
cartSchema.index({ user: 1 });

// Fast lookup for restaurant carts
cartSchema.index({ restaurant: 1 });

// Faster sorting by creation time
cartSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Cart", cartSchema);
