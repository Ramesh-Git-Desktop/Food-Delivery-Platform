const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "..", "logs");
const errorLogPath = path.join(logsDir, "errors.log");

const writeErrorToLogFile = (err, req) => {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const statusCode = err.statusCode || 500;
    const logEntry = [
      `[${timestamp}]`,
      `${req.method} ${req.originalUrl}`,
      `status=${statusCode}`,
      `message=${err.message || "Internal Server Error"}`,
      err.stack || "No stack trace available",
      ""
    ].join("\n");

    fs.appendFileSync(errorLogPath, `${logEntry}\n`, "utf8");
  } catch (logError) {
    // Intentionally swallow log write failures to avoid breaking the response flow.
  }
};

/**
 * Global error handler middleware.
 * Always returns the standard error format defined in api-doc.md
 */
const errorHandler = (err, req, res, next) => {
  // Base values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  writeErrorToLogFile(err, req);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    statusCode = 409;
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    errors =
      Object.values(err.errors || {}).map((val) => ({
        field: val.path,
        message: val.message,
      })) || [];
    statusCode = 400;
    message = "Validation failed";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File size exceeds 5MB limit";
  }

  // CSRF token errors
  if (err.code === "EBADCSRFTOKEN") {
    statusCode = 403;
    message = "Invalid or missing CSRF token";
  }

  const responseBody = new ApiResponse(statusCode, message, null, null, errors);
  responseBody.success = false;

  // Attach stack trace only in non-production for easier debugging
  if (process.env.NODE_ENV !== "production") {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;
