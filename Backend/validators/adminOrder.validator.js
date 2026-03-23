const { mongoIdParam, mongoIdBody } = require("./common.validator");

const reassignRiderValidator = [
  mongoIdParam("orderId"),
  mongoIdBody("riderId", "riderId"),
];

module.exports = {
  reassignRiderValidator,
};
