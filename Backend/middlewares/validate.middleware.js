const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

/**
 * Middleware to check express-validator results.
 * Place after validation rules in the route chain.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new ApiError(400, "Validation failed", extractedErrors));
  }
  next();
};

module.exports = { validate };
