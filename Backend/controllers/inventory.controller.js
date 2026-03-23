const Inventory = require("../models/inventory.model");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

//  Helper: Auto calculate stock status
const calculateStatus = (current, max) => {
  if (!max || max === 0) return "critical";

  const percentage = (current / max) * 100;

  if (percentage <= 20) return "critical";
  if (percentage <= 50) return "low";
  return "optimal";
};

//  Create Inventory Item
exports.createItem = asyncHandler(async (req, res) => {
  logger.info("Creating inventory item");

  const { stockLevel } = req.body;

  //  Auto status calculation
  if (stockLevel?.current !== undefined && stockLevel?.max !== undefined) {
    req.body.status = calculateStatus(
      stockLevel.current,
      stockLevel.max
    );
  }

  const item = await Inventory.create(req.body);

  res.status(201).json({
    success: true,
    data: item,
  });
});

// ➤ Get All Items (Filter + Pagination optional)
exports.getItems = asyncHandler(async (req, res) => {
  logger.info("Fetching inventory items");

  const { category, status, page = 1, limit = 10 } = req.query;

  let filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const items = await Inventory.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Inventory.countDocuments(filter);

  res.json({
    success: true,
    count: items.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: items,
  });
});

// Dashboard Stats
exports.getStats = asyncHandler(async (req, res) => {
  logger.info("Fetching inventory stats");

  const totalItems = await Inventory.countDocuments();

  const lowStock = await Inventory.countDocuments({
    status: "low",
  });

  const critical = await Inventory.countDocuments({
    status: "critical",
  });

  // ✅ Get start & end of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  // ✅ Monthly Spend Calculation
  const monthlySpendAgg = await Inventory.aggregate([
    {
      $match: {
        updatedAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    },
    {
      $project: {
        spend: {
          $multiply: ["$stockLevel.current", "$unitPrice"],
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$spend" },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalItems,
      lowStock,
      critical,
      monthlySpend: monthlySpendAgg[0]?.total || 0,
    },
  });
});

// ➤ Get Single Item
exports.getSingleItem = asyncHandler(async (req, res) => {
  logger.info(`Fetching item: ${req.params.id}`);

  const item = await Inventory.findById(req.params.id);

  if (!item) {
    logger.error("Item not found");
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  res.json({
    success: true,
    data: item,
  });
});

// Update Item
exports.updateItem = asyncHandler(async (req, res) => {
  logger.info(`Updating item: ${req.params.id}`);

  const { stockLevel } = req.body;

  // Recalculate status on update
  if (stockLevel?.current !== undefined && stockLevel?.max !== undefined) {
    req.body.status = calculateStatus(
      stockLevel.current,
      stockLevel.max
    );
  }

  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { returnDocument: "after", runValidators: true }
  );

  if (!item) {
    logger.error("Item not found");
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  res.json({
    success: true,
    data: item,
  });
});

// Delete Item
exports.deleteItem = asyncHandler(async (req, res) => {
  logger.info(`Deleting item: ${req.params.id}`);

  const item = await Inventory.findByIdAndDelete(req.params.id);

  if (!item) {
    logger.error("Item not found");
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  res.json({
    success: true,
    message: "Item deleted",
  });
});


exports.updateStockLevel = asyncHandler(async (req, res) => {
  logger.info(`Updating stock level for item: ${req.params.id}`);

  const { current, max } = req.body;

  // Validation
  if (current === undefined || max === undefined) {
    logger.error("Stock level (current, max) is required");
    return res.status(400).json({
      success: false,
      message: "current and max stock values are required",
    });
  }

  // Calculate status
  const status = calculateStatus(current, max);

  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    {
      stockLevel: { current, max },
      status,
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!item) {
    logger.error("Item not found");
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  res.json({
    success: true,
    message: "Stock level updated successfully",
    data: item,
  });
});
