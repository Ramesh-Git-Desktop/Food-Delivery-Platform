const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    logo: {
      type: String,
      default: "",
    },
    images: [{ type: String }],
    cuisineType: [
      {
        type: String,
        trim: true,
      },
    ],
    openingTime: {
      type: String,
      required: [true, "Opening time is required"],
    },
    closingTime: {
      type: String,
      required: [true, "Closing time is required"],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    deliveryRadius: {
      type: Number,
      default: 10, // in km
    },
    avgDeliveryTime: {
      type: Number,
      default: 30, // in minutes
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    documents: {
      fssaiLicense: { type: String, default: "" },
      gstCertificate: { type: String, default: "" },
      panCard: { type: String, default: "" },
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantAdmin",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
