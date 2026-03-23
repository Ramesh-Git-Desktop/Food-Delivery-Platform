const { optionalStringBody, mongoIdParam } = require("./common.validator");

const restaurantOrderActionValidator = [
  mongoIdParam("orderId"),
];

const rejectRestaurantOrderValidator = [
  mongoIdParam("orderId"),
  optionalStringBody("reason", "reason"),
];

module.exports = {
  restaurantOrderActionValidator,
  rejectRestaurantOrderValidator,
};
