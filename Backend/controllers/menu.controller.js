const Category = require("../models/Menu");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

const uploadCategoryImage = async (file) => {
  if (file.path) {
    return cloudinary.uploader.upload(file.path, {
      folder: "restaurant/categories",
    });
  }

  if (file.buffer) {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    return cloudinary.uploader.upload(dataUri, {
      folder: "restaurant/categories",
    });
  }

  throw new ApiError(400, "Invalid uploaded file");
};

const uploadMenuItemImage = async (file) => {
  if (file.path) {
    return cloudinary.uploader.upload(file.path, {
      folder: "menu-items",
    });
  }

  if (file.buffer) {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    return cloudinary.uploader.upload(dataUri, {
      folder: "menu-items",
    });
  }

  throw new ApiError(400, "Invalid uploaded file");
};

const resolveRestaurant = async (restaurantIdOrAdminId) => {
  let restaurant = await Restaurant.findById(restaurantIdOrAdminId);
  if (restaurant) return restaurant;

  // Fallback: allow passing RestaurantAdmin id in routes for convenience.
  restaurant = await Restaurant.findOne({ admin: restaurantIdOrAdminId });
  return restaurant;
};

const ensureRestaurantOwnership = async (req, restaurantIdOrAdminId) => {
  const requesterId = req.user?._id;

  if (!requesterId) {
    throw new ApiError(401, "Authentication required");
  }

  const restaurant = await resolveRestaurant(restaurantIdOrAdminId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const ownerId = restaurant.owner || restaurant.admin;

  if (!ownerId || String(ownerId) !== String(requesterId)) {
    throw new ApiError(403, "You are not authorized to access this restaurant");
  }

  return restaurant;
};

const parseBoolean = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  return undefined;
};

exports.createCategory = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { name, isActive } = req.body;
  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  if (!req.file) {
    throw new ApiError(400, "Category image is required");
  }

  const existingCategory = await Category.findOne({
    restaurant: restaurant._id,
    name: name.trim(),
  });

  if (existingCategory) {
    throw new ApiError(400, "Category already exists");
  }

  const result = await uploadCategoryImage(req.file);

  const category = await Category.create({
    restaurant: restaurant._id,
    name: name.trim(),
    image: result.secure_url,
    isActive: isActive !== undefined ? isActive === "true" : true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Category created successfully", category));
});




exports.getCategories = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await resolveRestaurant(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const categories = await Category.find({
    restaurant: restaurant._id,
    isActive: true,
  }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Categories fetched successfully", categories));
});



exports.updateCategory = asyncHandler(async (req, res) => {
  const { restaurantId, categoryId } = req.params;
  const { name, isActive } = req.body;
  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  const category = await Category.findOne({
    _id: categoryId,
    restaurant: restaurant._id,
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (name) {
    const duplicate = await Category.findOne({
      _id: { $ne: categoryId },
      restaurant: restaurant._id,
      name: name.trim(),
    });

    if (duplicate) {
      throw new ApiError(400, "Category with this name already exists");
    }

    category.name = name.trim();
  }

  if (req.file) {
    const result = await uploadCategoryImage(req.file);

    category.image = result.secure_url;
  }

  if (isActive !== undefined) {
    category.isActive = isActive === "true";
  }

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Category updated successfully", category));
});



exports.deleteCategory = asyncHandler(async (req, res) => {
  const { restaurantId, categoryId } = req.params;
  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  const category = await Category.findOneAndDelete({
    _id: categoryId,
    restaurant: restaurant._id,
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Category deleted successfully"));
});


exports.addMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const {
    name,
    description,
    price,
    category,
    isVeg,
    isAvailable,
    preparationTime,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, "Invalid restaurantId");
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Menu item name is required");
  }

  if (!category) {
    throw new ApiError(400, "Category is required");
  }

  if (price === undefined || price === null || price === "") {
    throw new ApiError(400, "Price is required");
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    throw new ApiError(400, "Price must be a valid non-negative number");
  }

  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid category id");
  }

  const categoryDoc = await Category.findOne({
    _id: category,
    restaurant: restaurant._id,
  });

  if (!categoryDoc) {
    throw new ApiError(400, "Category does not belong to this restaurant");
  }

  if (!req.file) {
    throw new ApiError(400, "Image is required");
  }

  const result = await uploadMenuItemImage(req.file);

  const menuItem = await MenuItem.create({
    restaurant: restaurant._id,
    name: name.trim(),
    description,
    price: parsedPrice,
    category,
    isVeg: parseBoolean(isVeg) ?? false,
    isAvailable: parseBoolean(isAvailable) ?? true,
    preparationTime,
    image: result.secure_url,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Menu item added successfully", menuItem));
});


exports.getMenuItems = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { category, isVeg, minPrice, maxPrice } = req.query;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, "Invalid restaurantId");
  }

  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  let matchStage = { restaurant: restaurant._id };

  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new ApiError(400, "Invalid category id");
    }
    const categoryDoc = await Category.findOne({
      _id: category,
      restaurant: restaurant._id,
    });
    if (!categoryDoc) {
      throw new ApiError(400, "Category does not belong to this restaurant");
    }
    matchStage.category = categoryDoc._id;
  }

  const parsedIsVeg = parseBoolean(isVeg);
  if (parsedIsVeg !== undefined) matchStage.isVeg = parsedIsVeg;

  if (minPrice || maxPrice) {
    matchStage.price = {};
    if (minPrice) matchStage.price.$gte = Number(minPrice);
    if (maxPrice) matchStage.price.$lte = Number(maxPrice);
  }

  const menuItems = await MenuItem.find(matchStage).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Menu items fetched successfully", menuItems)
  );
});


exports.getSingleMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, "Invalid restaurantId");
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(400, "Invalid itemId");
  }

  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  const restaurantIdPool = [restaurant._id];
  if (restaurant.admin) {
    restaurantIdPool.push(restaurant.admin);
  }

  const menuItem = await MenuItem.findOne({
    _id: itemId,
    restaurant: { $in: restaurantIdPool },
  });

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Menu item fetched successfully", menuItem));
});



exports.updateMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;
  const { name, description, price, category, isVeg, isAvailable, preparationTime } = req.body;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, "Invalid restaurantId");
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(400, "Invalid itemId");
  }

  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  const menuItem = await MenuItem.findOne({ _id: itemId, restaurant: restaurant._id });
  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  if (category !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new ApiError(400, "Invalid category id");
    }
    menuItem.category = category;
  }

  if (name !== undefined) menuItem.name = name;
  if (description !== undefined) menuItem.description = description;
  if (price !== undefined) menuItem.price = price;
  const parsedUpdateIsVeg = parseBoolean(isVeg);
  if (parsedUpdateIsVeg !== undefined) menuItem.isVeg = parsedUpdateIsVeg;

  const parsedIsAvailable = parseBoolean(isAvailable);
  if (parsedIsAvailable !== undefined) menuItem.isAvailable = parsedIsAvailable;
  if (preparationTime !== undefined) menuItem.preparationTime = preparationTime;

  if (req.file) {
    const result = await uploadMenuItemImage(req.file);
    menuItem.image = result.secure_url;
  }

  const updatedItem = await menuItem.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Menu item updated successfully", updatedItem));
});


exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, "Invalid restaurantId");
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(400, "Invalid itemId");
  }

  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  const restaurantIdPool = [restaurant._id];
  if (restaurant.admin) {
    restaurantIdPool.push(restaurant.admin);
  }

  const menuItem = await MenuItem.findOne({
    _id: itemId,
    restaurant: { $in: restaurantIdPool },
  });
  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  await menuItem.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "Menu item deleted successfully", {}));
});


exports.toggleAvailability = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, "Invalid restaurantId");
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(400, "Invalid itemId");
  }

  const restaurant = await ensureRestaurantOwnership(req, restaurantId);

  const restaurantIdPool = [restaurant._id];
  if (restaurant.admin) {
    restaurantIdPool.push(restaurant.admin);
  }

  const menuItem = await MenuItem.findOne({
    _id: itemId,
    restaurant: { $in: restaurantIdPool },
  });
  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Menu item availability toggled successfully",
        menuItem
      )
    );
});
