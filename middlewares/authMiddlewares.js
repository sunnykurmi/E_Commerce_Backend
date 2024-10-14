const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Middleware to check if the user is logged in using a cookie
const isLoggedIn = (req, res, next) => {
  // Get the token from cookies (ensure 'cookie-parser' middleware is set up)
  const token = req.cookies.token;

  // Check if the token is not present
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.id; // Store user info in req.id
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid token.", error: error.message });
  }
};

const isSeller = async (req, res, next) => {
  try {
    // Find the user in the database
    const user = await userModel.findById(req.id);

    if (!user || !user.isSeller) {
      return res
        .status(403)
        .json({ message: "Only sellers are allowed to perform this action." });
    }

    

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  isLoggedIn,
  isSeller,
};
