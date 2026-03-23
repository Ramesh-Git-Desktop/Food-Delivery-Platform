const { body } = require("express-validator");

const searchRestaurantsValidator = [
  body().custom((_, { req }) => {
    const searchValue =
      req.body?.q ||
      req.body?.category ||
      req.query?.q ||
      req.query?.category;

    if (!searchValue || String(searchValue).trim() === "") {
      throw new Error("q or category is required");
    }

    return true;
  }),
];

module.exports = {
  searchRestaurantsValidator,
};
