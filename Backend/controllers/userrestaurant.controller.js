const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const { isValidObjectId } = require("../utils/objectId");

const toSingleString = (value) => {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildRestaurantSort = (sort) => {
  const sortMap = {
    avgRating: { avgRating: 1 },
    "-avgRating": { avgRating: -1 },
    avgDeliveryTime: { avgDeliveryTime: 1 },
    "-avgDeliveryTime": { avgDeliveryTime: -1 },
    createdAt: { createdAt: 1 },
    "-createdAt": { createdAt: -1 }
  };

  return sortMap[sort] || null;
};

const getVisibleRestaurantLookupStages = () => ([
  {
    $lookup: {
      from: "restaurantadmins",
      let: { adminId: "$admin" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$adminId"] },
            status: "approved"
          }
        },
        { $project: { _id: 1 } }
      ],
      as: "approvedRestaurantAdmin"
    }
  },
  {
    $lookup: {
      from: "users",
      let: { adminId: "$admin" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$adminId"] },
            role: "admin"
          }
        },
        { $project: { _id: 1 } }
      ],
      as: "legacyAdmin"
    }
  },
  {
    $match: {
      $or: [
        { "approvedRestaurantAdmin.0": { $exists: true } },
        { "legacyAdmin.0": { $exists: true } }
      ]
    }
  },
  {
    $project: {
      approvedRestaurantAdmin: 0,
      legacyAdmin: 0
    }
  }
]);

const findVisibleRestaurants = async ({ match = {}, sort = null }) => {
  const pipeline = [{ $match: match }];

  if (sort) {
    pipeline.push({ $sort: sort });
  }

  pipeline.push(...getVisibleRestaurantLookupStages());

  return Restaurant.aggregate(pipeline);
};

// GET /api/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const cuisine = toSingleString(req.query.cuisine);
    const city = toSingleString(req.query.city);
    const sort = toSingleString(req.query.sort);
    const minRating = Number(toSingleString(req.query.minRating));

    const query = {};

    if (cuisine) {
      query.cuisineType = { $regex: `^${escapeRegex(cuisine)}$`, $options: "i" };
    }

    if (city) {
      query.city = { $regex: `^${escapeRegex(city)}$`, $options: "i" };
    }

    if (!Number.isNaN(minRating) && minRating > 0) {
      query.avgRating = { $gte: minRating };
    }

    const result = await findVisibleRestaurants({
      match: query,
      sort: buildRestaurantSort(sort)
    });

    res.status(200).json({
      success: true,
      restaurants: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET /api/restaurants/:id
exports.getRestaurantById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurantId"
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.json({
      success: true,
      restaurant
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET /api/restaurants/search
exports.searchRestaurants = async (req, res) => {
  try {
    const q = toSingleString(req.query.q || req.query.category || req.body?.q || req.body?.category);
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "q or category is required"
      });
    }

    const escapedQ = escapeRegex(q);

    const matchedMenuItems = await MenuItem.find({
      name: { $regex: escapedQ, $options: "i" }
    }).select("restaurant");

    const matchedRestaurantIds = [
      ...new Set(
        matchedMenuItems
          .map((item) => item.restaurant)
          .filter(Boolean)
          .map((restaurantId) => String(restaurantId))
      )
    ];

    const searchConditions = [
      { name: { $regex: escapedQ, $options: "i" } },
      { cuisineType: { $regex: escapedQ, $options: "i" } }
    ];

    if (matchedRestaurantIds.length > 0) {
      // Legacy compatibility: some menu items may be saved with admin id instead of restaurant id.
      searchConditions.push({ _id: { $in: matchedRestaurantIds } });
      searchConditions.push({ admin: { $in: matchedRestaurantIds } });
    }

    const restaurants = await findVisibleRestaurants({
      match: { $or: searchConditions }
    });

    res.json({
      success: true,
      restaurants
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET /api/restaurants/cuisine/:cuisineType
exports.getByCuisine = async (req, res) => {
  try {
    const cuisineType = toSingleString(req.params.cuisineType);

    const restaurants = await findVisibleRestaurants({
      match: {
        cuisineType: { $regex: `^${escapeRegex(cuisineType)}$`, $options: "i" }
      }
    });

    res.json({
      success: true,
      restaurants
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
