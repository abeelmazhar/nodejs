/**
 * Authentication Routes
 * Defines all routes related to user authentication
 */

const express = require("express");
const router = express.Router();

// Import authentication controller functions
const { signup, login, verifyOTP } = require("../controllers/authController");

/**
 * POST /auth/signup
 * Route to register a new user
 * Requires: name, email, password in request body
 * Returns: User data (without password) on success
 */
router.post("/signup", signup);

/**
 * POST /auth/login
 * Route to authenticate a user and send OTP
 * Requires: email, password in request body
 * Returns: Success message indicating OTP has been sent
 */
router.post("/login", login);

/**
 * POST /auth/verify-otp
 * Route to verify OTP and complete login
 * Requires: email, otp in request body
 * Returns: User data (without password) on success
 */
router.post("/verify-otp", verifyOTP);

// Export the router to be used in server.js
module.exports = router;
