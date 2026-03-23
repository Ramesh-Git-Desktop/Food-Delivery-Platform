const ApiResponse = require("../utils/apiResponse");

const pickRemainingData = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  const { success, message, pagination, errors, stack, data, ...rest } = payload;
  return Object.keys(rest).length > 0 ? rest : data ?? null;
};

const responseFormatter = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    if (payload instanceof ApiResponse) {
      return originalJson(payload);
    }

    const statusCode = res.statusCode || 200;

    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      const hasSuccess = Object.prototype.hasOwnProperty.call(payload, "success");
      const hasMessage = Object.prototype.hasOwnProperty.call(payload, "message");

      if (hasSuccess || hasMessage) {
        const message = payload.message || (statusCode < 400 ? "Request successful" : "Request failed");
        const data = Object.prototype.hasOwnProperty.call(payload, "data")
          ? payload.data
          : pickRemainingData(payload);

        const formatted = new ApiResponse(
          statusCode,
          message,
          data,
          payload.pagination || null,
          payload.errors || []
        );

        if (typeof payload.success === "boolean") {
          formatted.success = payload.success;
        }

        if (payload.stack) {
          formatted.stack = payload.stack;
        }

        return originalJson(formatted);
      }
    }

    const fallbackMessage = statusCode < 400 ? "Request successful" : "Request failed";
    return originalJson(new ApiResponse(statusCode, fallbackMessage, payload));
  };

  next();
};

module.exports = { responseFormatter };
