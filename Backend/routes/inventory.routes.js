const express = require("express");
const router = express.Router();

const {
  createItem,
  getItems,
  getStats,
  updateItem,
  deleteItem,
  updateStockLevel,
} = require("../controllers/inventory.controller");

router.post("/", createItem);
router.get("/", getItems);
router.get("/stats", getStats);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.patch("/:id/stock", updateStockLevel);

module.exports = router;