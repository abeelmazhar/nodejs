/**
 * Authentication Controller
 * Handles user authentication operations like signup and login
 */

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const path = require("path");
const otpService = require("../utils/otpService");
const emailService = require("../utils/emailService");
const passwordResetService = require("../utils/passwordResetService");

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

    // Get the next sequential ID (1, 2, 3, 4, ...)
    const nextId = await User.getNextId();

    // Create new user document with sequential ID
    const newUser = new User({
      id: nextId, // Assign sequential ID
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
        id: newUser.id, // Return sequential ID instead of _id
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

/**
 * User Login
 * Authenticates a user with email and password
 *
 */
const login = async (req, res) => {
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
        error: "Please send email and password in the request body",
      });
    }

    // Extract login credentials from request body
    const { email, password } = req.body;

    // Validation: Check if all required fields are provided
    const errors = {};

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
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Find user by email in database
    // We need to explicitly select the password field because it's set to select: false in the model
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        error: "Email or password is incorrect",
      });
    }

    // Compare the provided password with the hashed password stored in database
    // bcrypt.compare() securely compares plain text password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If password doesn't match, return error
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        error: "Email or password is incorrect",
      });
    }

    // Generate and store OTP for the user
    const otp = otpService.storeOTP(user.email, user.id.toString());

    // Send OTP to user's email
    try {
      await emailService.sendOTPEmail(user.email, otp, user.name || "User");
    } catch (emailError) {
      // Log the detailed error for debugging
      console.error("Failed to send OTP email:", emailError);

      // Return detailed error message to help with debugging
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
        error:
          emailError.message ||
          "Please check your email configuration or try again later.",
        details:
          process.env.NODE_ENV === "development"
            ? {
                hint: "Make sure you have set EMAIL_USER, EMAIL_PASSWORD, and EMAIL_SERVICE in your .env file",
                emailService: process.env.EMAIL_SERVICE || "gmail",
                hasEmailUser: !!process.env.EMAIL_USER,
                hasEmailPassword: !!process.env.EMAIL_PASSWORD,
              }
            : undefined,
      });
    }

    // Return success response indicating OTP has been sent
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please check your inbox and verify.",
      data: {
        email: user.email,
        message:
          "An OTP has been sent to your email address. Please verify it to complete login.",
      },
    });
  } catch (error) {
    // Handle different types of errors

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

/**
 * Verify OTP and Complete Login
 * Verifies the OTP sent to user's email and completes the login process
 */
const verifyOTP = async (req, res) => {
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
        error: "Please send email and otp in the request body",
      });
    }

    // Extract email and OTP from request body
    const { email, otp } = req.body;

    // Validation: Check if all required fields are provided
    const errors = {};

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

    // Validate OTP
    if (!otp) {
      errors.otp = "OTP is required";
    } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      errors.otp = "OTP must be a 6-digit number";
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Verify OTP
    const otpResult = otpService.verifyOTP(email, otp);

    // If OTP is invalid or expired
    if (!otpResult) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
        error:
          "The OTP you entered is incorrect or has expired. Please try logging in again.",
      });
    }

    // OTP is valid, find the user by sequential ID
    const user = await User.findOne({ id: parseInt(otpResult.userId) });

    // Check if user still exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "User account no longer exists.",
      });
    }

    // Get base URL for image
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = user.image
      ? user.image.startsWith("http")
        ? user.image
        : `${baseUrl}/uploads/${path.basename(user.image)}`
      : null;

    // Login successful - return user data
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id, // Return sequential ID instead of _id
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null,
        city: user.city || null,
        school: user.school || null,
        class: user.class || null,
        image: imageUrl, // Return full URL
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Handle different types of errors

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

/**
 * Forgot Password
 * Sends a password reset token to user's email
 */
const forgotPassword = async (req, res) => {
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
        error: "Please send email in the request body",
      });
    }

    // Extract email from request body
    const { email } = req.body;

    // Validation: Check if email is provided
    const errors = {};

    if (!email) {
      errors.email = "Email is required";
    } else {
      // Email format validation using regex
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please provide a valid email address";
      }
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Find user by email in database
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // For security, don't reveal if email exists or not
    // Always return success message to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate and store reset token
    const resetToken = passwordResetService.storeResetToken(
      user.email,
      user.id.toString()
    );

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name || "User"
      );
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
        error: emailError.message || "Please check your email configuration or try again later.",
      });
    }

    // Return success response (don't reveal if email exists)
    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
      data: {
        email: user.email,
        // In production, don't send token in response
        // Only include for development/testing
        ...(process.env.NODE_ENV === "development" && {
          token: resetToken,
          note: "Token only shown in development mode",
        }),
      },
    });
  } catch (error) {
    // Handle different types of errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
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

/**
 * Reset Password
 * Resets user password using the reset token
 */
const resetPassword = async (req, res) => {
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
        error: "Please send email, token, and newPassword in the request body",
      });
    }

    // Extract data from request body
    const { email, token, newPassword } = req.body;

    // Validation: Check if all required fields are provided
    const errors = {};

    if (!email) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please provide a valid email address";
      }
    }

    if (!token) {
      errors.token = "Reset token is required";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 4) {
      errors.newPassword = "Password must be at least 4 characters";
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Verify reset token
    const tokenResult = passwordResetService.verifyResetToken(email, token);

    // If token is invalid or expired
    if (!tokenResult) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
        error:
          "The reset token is invalid or has expired. Please request a new password reset.",
      });
    }

    // Find user by ID
    const user = await User.findOne({ id: parseInt(tokenResult.userId) });

    // Check if user still exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "User account no longer exists.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: {
        email: user.email,
        message: "Your password has been reset successfully. You can now login with your new password.",
      },
    });
  } catch (error) {
    // Handle different types of errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
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
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
};
