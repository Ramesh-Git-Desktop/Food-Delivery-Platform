const mongoose = require("mongoose");
const ApiError = require("./apiError");

const isValidObjectId = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();

  if (!mongoose.Types.ObjectId.isValid(trimmedValue)) {
    return false;
  }

  return String(new mongoose.Types.ObjectId(trimmedValue)) === trimmedValue;
};

const assertValidObjectId = (value, fieldName = "resourceId") => {
  if (!isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }

  return value.trim();
};

module.exports = {
  isValidObjectId,
  assertValidObjectId,
};
