/**
 * Authentication Routes
 * Defines all routes related to user authentication
 */

const express = require("express");
const router = express.Router();

// Import authentication controller functions
const {
  signup,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} = require("../controllers/authController");

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

/**
 * POST /auth/forgot-password
 * Route to request password reset
 * Requires: email in request body
 * Returns: Success message (always returns success for security)
 */
router.post("/forgot-password", forgotPassword);

/**
 * POST /auth/reset-password
 * Route to reset password using token
 * Requires: email, token, newPassword in request body
 * Returns: Success message on successful password reset
 */
router.post("/reset-password", resetPassword);

/**
 * POST /auth/refresh-token
 * Route to refresh access token using refresh token
 * Requires: refreshToken in request body
 * Returns: New access token
 */
router.post("/refresh-token", refreshToken);

/**
 * POST /auth/logout
 * Route to logout and blacklist tokens
 * Requires: refreshToken in request body (optional)
 * Returns: Success message
 */
router.post("/logout", logout);

// Export the router to be used in server.js
module.exports = router;
