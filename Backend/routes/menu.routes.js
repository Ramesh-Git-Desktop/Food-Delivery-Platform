const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/menu.controller");
const { uploadSingle } = require("../middlewares/upload.middleware");
const {
  addMenuItem,
  getMenuItems,
  getSingleMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require("../controllers/menu.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createCategoryValidator,
  updateCategoryValidator,
  createMenuItemValidator,
  updateMenuItemValidator,
  toggleAvailabilityValidator,
} = require("../validators/menu.validator");


router.post(
  "/:restaurantId/categories",
  protect,
  authorize("restaurant-admin"),
  uploadSingle("image"),
  createCategoryValidator,
  validate,
  createCategory
);

router.get(
  "/:restaurantId/categories",
  getCategories
);

router.put(
  "/:restaurantId/categories/:categoryId",
  protect,
  authorize("restaurant-admin"),
  uploadSingle("image"),
  updateCategoryValidator,
  validate,
  updateCategory
);
router.delete(
  "/:restaurantId/categories/:categoryId",
  protect,
  authorize("restaurant-admin"),
  deleteCategory
);


// Restaurant Admin APIs

router.post(
  "/:restaurantId/menu",
  protect,
  authorize("restaurant-admin"),
  uploadSingle("image"),
  createMenuItemValidator,
  validate,
  addMenuItem
);

router.get(
  "/:restaurantId/menu",
  getMenuItems
);

router.get(
  "/:restaurantId/menu/:itemId",
  getSingleMenuItem
);

router.put(
  "/:restaurantId/menu/:itemId",
  protect,
  authorize("restaurant-admin"),
  uploadSingle("image"),
  updateMenuItemValidator,
  validate,
  updateMenuItem
);

router.delete(
  "/:restaurantId/menu/:itemId",
  protect,
  authorize("restaurant-admin"),
  deleteMenuItem
);

router.put(
  "/:restaurantId/menu/:itemId/toggle-availability",
  protect,
  authorize("restaurant-admin"),
  toggleAvailabilityValidator,
  validate,
  toggleAvailability
);


module.exports = router;
