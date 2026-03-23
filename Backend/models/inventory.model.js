const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["protein", "produce", "dairy", "bakery"],
      required: true,
    },
    stockLevel: {
      current: Number,
      max: Number,
    },
    unit: {
      type: String,
      default: "kg",
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    supplier: {
      name: String,
      leadTime: String,
    },
    status: {
      type: String,
      enum: ["critical", "low", "optimal"],
      default: "optimal",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);