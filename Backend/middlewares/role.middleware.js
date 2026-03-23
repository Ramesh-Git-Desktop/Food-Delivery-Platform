const ApiError = require("../utils/apiError");

/**
 * Role-based access control middleware.
 * Usage: authorize("main-admin", "restaurant-admin")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role '${req.user.role}' is not authorized to access this route`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
