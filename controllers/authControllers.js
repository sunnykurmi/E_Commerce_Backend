const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator"); // Import express-validator
const userModel = require("../models/userModel"); // Adjust the path according to your project structure

// Register function with validation
const register = async (req, res) => {
  // Validate the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, isSeller } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      isSeller,
      username: `${name.split(" ").join("_")}_${Date.now()}`,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const user = await userModel.findOne({email})

    // Optionally set the token in a cookie
    res.cookie("token", token, { httpOnly: true }); // Optional: Use secure: true in production
    res
      .status(201)
      .json({ message: "User registered successfully.", newUser:user, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user.", error: error.message });
    console.log(error);
  }
};

// Login function with validation
const login = async (req, res) => {
  // Validate the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne( {email} ).select("password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const loggedinUser = await userModel.findOne( {email} ).exec();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ message: "Login successful.", user:loggedinUser, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in.", error: error.message });
  }
};

// Logout function
const logout = (req, res) => {
  res.clearCookie("token"); // Clear the cookie if you are using it
  res.json({
    message: "Logout successful. Please remove the token from the client.",
  });
};

// Validation rules for registration and login
const validateRegistration = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Please enter a valid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
];

const validateLogin = [
  check("email").isEmail().withMessage("Please enter a valid email"),
  check("password").not().isEmpty().withMessage("Password is required"),
];

// Function to fetch a single user's details
const getSingleUser = async (req, res) => {
  try {
    // Find the user by ID
    const user = await userModel.findById(req.id);

    // If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data (excluding password for security reasons)
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const test = async (req, res) => {
  res.json({ message: "Test route working" });
};

module.exports = {
  register,
  login,
  logout,
  validateRegistration,
  validateLogin,
  getSingleUser,
  test, // Additional function for testing the API endpoint
};
