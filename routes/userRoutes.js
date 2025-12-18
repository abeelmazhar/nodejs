/**
 * User Routes
 * Defines all routes related to user account management
 */

const express = require("express");
const router = express.Router();

// Import authentication middleware
const { authenticate } = require("../middleware/authMiddleware");

// Import user controller functions
const {
  getMyAccount,
  updateMyAccount,
} = require("../controllers/userController");

/**
 * GET /my-account
 * Route to get current user's account information
 * Requires: Authorization header with Bearer token
 * Returns: User account data (all fields, null if not set)
 */
router.get("/", authenticate, getMyAccount);

/**
 * PUT /my-account
 * Route to update current user's account information
 * Requires: Authorization header with Bearer token, and fields to update in body
 * Returns: Updated user account data
 */
router.put("/", authenticate, updateMyAccount);

// Export the router to be used in server.js
module.exports = router;
