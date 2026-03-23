const { mongoIdParam } = require("./common.validator");

const markNotificationAsReadValidator = [
  mongoIdParam("id"),
];

module.exports = {
  markNotificationAsReadValidator,
};
