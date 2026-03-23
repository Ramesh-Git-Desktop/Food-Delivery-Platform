const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },
    type: {
      type: String,
      enum: ["restaurant", "rider"],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
      validate: {
        validator(value) {
          return !value || value.length >= 5;
        },
        message: "Review must be at least 5 characters long",
      },
    },
  },
  { timestamps: true }
);

reviewSchema.index(
  { user: 1, order: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);
