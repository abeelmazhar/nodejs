/**
 * Authentication Controller
 * Handles user authentication operations like signup and login
 */

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

/**
 * User Signup
 * Creates a new user account with email, password, and name
 *

 */
const signup = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection not available",
        error:
          "Please wait a moment and try again. The database is connecting.",
      });
    }

    // Check if request body exists
    if (
      !req.body ||
      (typeof req.body === "object" && Object.keys(req.body).length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing",
        error: "Please send name, email, and password in the request body",
      });
    }

    // Extract user data from request body
    const { name, email, password } = req.body;

    // Validation: Check if all required fields are provided
    const errors = {};

    // Validate name
    if (!name) {
      errors.name = "Name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 10) {
      errors.name = "Name cannot exceed 10 characters";
    }

    // Validate email
    if (!email) {
      errors.email = "Email is required";
    } else {
      // Email format validation using regex
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please provide a valid email address";
      }
    }

    // Validate password
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 4) {
      errors.password = "Password must be at least 4 characters";
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Check if user with this email already exists
    // This prevents duplicate email registrations
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        error:
          "A user with this email already exists. Please use a different email or try logging in.",
      });
    }

    // Hash the password before storing in database
    // bcrypt.hash() generates a secure hash of the password
    // 10 is the salt rounds (higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword, // Store hashed password, never store plain text
    });

    // Save user to database
    await newUser.save();

    // Return success response
    // Note: We don't return the password in the response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    // Handle different types of errors

    // MongoDB duplicate key error (if unique constraint fails)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        error: "A user with this email already exists.",
      });
    }

    // MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
      // Extract validation errors from Mongoose
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

// Export the controller functions
module.exports = {
  signup,
};
