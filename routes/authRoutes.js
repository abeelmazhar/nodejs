/**
 * Authentication Routes
 * Defines all routes related to user authentication
 */

const express = require("express");
const router = express.Router();

// Import authentication controller functions
const { signup } = require("../controllers/authController");

/**
 * POST /auth/signup
 * Route to register a new user
 * Requires: name, email, password in request body
 * Returns: User data (without password) on success
 */
router.post("/signup", signup);

// Export the router to be used in server.js
module.exports = router;
