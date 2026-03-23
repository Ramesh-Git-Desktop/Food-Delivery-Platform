const express = require("express");
const router = express.Router();

const {
  getRestaurants,
  getRestaurantById,
  searchRestaurants,
  getByCuisine
} = require("../controllers/userrestaurant.controller");
const { validate } = require("../middlewares/validate.middleware");
const { searchRestaurantsValidator } = require("../validators/userrestaurant.validator");

/**
 * @swagger
 * tags:
 *   - name: Public Restaurants
 *
 * /api/restaurants:
 *   get:
 *     summary: List restaurants
 *     tags: [Public Restaurants]
 *     responses:
 *       200:
 *         description: Restaurants fetched
 *
 * /api/restaurants/search:
 *   get:
 *     summary: Search restaurants
 *     tags: [Public Restaurants]
 *     responses:
 *       200:
 *         description: Search results
 */

router.get("/", getRestaurants);
router.get("/search", searchRestaurants);
router.post("/search", searchRestaurantsValidator, validate, searchRestaurants);
router.get("/cuisine/:cuisineType", getByCuisine);
router.get("/:id", getRestaurantById);

module.exports = router;
