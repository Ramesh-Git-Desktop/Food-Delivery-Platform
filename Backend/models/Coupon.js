
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
{
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    uppercase: true,
    trim: true
  },

  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    required: true
  },

  discountValue: {
    type: Number,
    required: true
  },

  maxDiscount: {
    type: Number,
    default: 0
    //required: true
  },

  minOrderValue: {
    type: Number,
    default: 0
    //required: true
  },

  usageLimit: {
    type: Number,
    default: 1
  },

  usedCount: {
    type: Number,
    default: 0
    //required: true
  },

  validFrom: {
    type: Date,
    required: true
  },

  validUntil: {
    type: Date,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },
  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
},
{ timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);