const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const { assertValidObjectId } = require("../utils/objectId");

exports.addToCart = asyncHandler(async (req, res) => {
  const { menuItemId, restaurantId, quantity } = req.body;
  const userId = req.user._id;
  const normalizedRestaurantId = assertValidObjectId(restaurantId, "restaurantId");
  const normalizedMenuItemId = assertValidObjectId(menuItemId, "menuItemId");

  if (quantity <= 0) {
    res.status(400);
    throw new Error("Quantity must be greater than 0");
  }

  const restaurant = await Restaurant.findById(normalizedRestaurantId);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const menuItem = await MenuItem.findById(normalizedMenuItemId);
  if (!menuItem) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  if (String(menuItem.restaurant) !== String(restaurant._id)) {
    res.status(400);
    throw new Error("Menu item does not belong to the selected restaurant");
  }

  let cart = await Cart.findOne({ user: userId });

  if (cart && cart.restaurant.toString() !== normalizedRestaurantId) {
    res.status(400);
    throw new Error(
      "Your cart contains items from another restaurant. Please clear cart first."
    );
  }

  if (!cart) {
    cart = new Cart({
      user: userId,
      restaurant: normalizedRestaurantId,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.item.toString() === normalizedMenuItemId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      item: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    });
  }

  cart.totalAmount = calculateTotal(cart.items);

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    cart,
  });
});

exports.getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate("items.item");

  if (!cart) {
    return res.json({
      items: [],
      totalAmount: 0,
    });
  }

  res.json(cart);
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const itemId = assertValidObjectId(req.params.itemId, "itemId");
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find((i) => i.item.toString() === itemId);

  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  item.quantity = quantity;
  cart.totalAmount = calculateTotal(cart.items);

  await cart.save();

  res.json(cart);
});

exports.removeCartItem = asyncHandler(async (req, res) => {
  const itemId = assertValidObjectId(req.params.itemId, "itemId");
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemExists = cart.items.some((item) => item.item.toString() === itemId);
  if (!itemExists) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  cart.items = cart.items.filter((item) => item.item.toString() !== itemId);
  cart.totalAmount = calculateTotal(cart.items);

  await cart.save();

  res.json({
    message: "Item removed",
    cart,
  });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Cart.findOneAndDelete({ user: userId });

  res.json({
    message: "Cart cleared successfully",
  });
});

const calculateTotal = (items) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);
