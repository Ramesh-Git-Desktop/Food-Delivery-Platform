const jwt = require("jsonwebtoken");

/**
 * Generate JWT token and optionally set it as a cookie.
 * @param {Object} user - User object with _id and role
 * @param {Object} res - Express response object
 * @returns {string} JWT token
 */
const generateToken = (user, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  // Set cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);

  return token;
};

module.exports = generateToken;
