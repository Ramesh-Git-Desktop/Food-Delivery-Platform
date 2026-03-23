
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");

const Admin = require("../models/Admin");
const RestaurantAdmin = require("../models/RestaurantAdmin");
const Rider = require("../models/Rider");
const User = require("../models/User");

const ensureRiderAccess = (rider) => {
  if (!rider) return;

  if (rider.status === "suspended") {
    throw new ApiError(403, "Your rider account is suspended");
  }

  if (rider.status !== "approved") {
    throw new ApiError(403, "Your rider account is not active");
  }
};

/**
 * Protect routes — verify JWT token
 */
const protect = async (req, res, next) => {

  let token;

  // Check cookies
  if (req.cookies && (req.cookies.token || req.cookies.riderToken)) {
    token = req.cookies.token || req.cookies.riderToken;
  }

  // Check Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(401, "Not authorized, token missing"));
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id;

    let user;

    switch (decoded.role) {

      case "main-admin":
        user = await Admin.findById(userId).select("-password");
        break;

      case "restaurant-admin":
        user = await RestaurantAdmin.findById(userId).select("-password");
        break;

      case "rider":
        user = await Rider.findById(userId).select("-password");
        if (user) {
          await user.refreshSuspensionStatus();
          ensureRiderAccess(user);
        }
        break;

      case "user":
        user = await User.findById(userId).select("-password");
        if (user && user.isVerified === false) {
          return next(new ApiError(401, "Please verify your email first"));
        }
        break;

      default:
        return next(new ApiError(401, "Invalid role"));
    }

    if (!user) {
      return next(new ApiError(401, "User not found"));
    }

    req.user = user;
    req.user.role = decoded.role;

    next();

  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(new ApiError(401, "Token invalid"));
  }

};


/**
 * Allow only MAIN ADMIN
 */
const mainAdminOnly = (req, res, next) => {

  if (req.user && req.user.role === "main-admin") {
    return next();
  }

  return next(new ApiError(403, "Main admin access required"));

};


/**
 * Allow RESTAURANT ADMIN
 */
const restaurantAdminOnly = (req, res, next) => {

  if (req.user && req.user.role === "restaurant-admin") {
    return next();
  }

  return next(new ApiError(403, "Restaurant admin access required"));

};


/**
 * Allow normal USER
 */
const userOnly = (req, res, next) => {

  if (req.user && req.user.role === "user") {
    return next();
  }

  return next(new ApiError(403, "User access required"));

};


module.exports = {
  protect,
  mainAdminOnly,
  restaurantAdminOnly,
  userOnly
};
