/**
 * User Routes
 * Defines all routes related to user account management
 */

const express = require("express");
const router = express.Router();

// Import user controller functions
const {
  getMyAccount,
  updateMyAccount,
} = require("../controllers/userController");

/**
 * GET /my-account
 * Route to get current user's account information
 * Requires: userId in query parameters
 * Returns: User account data (all fields, null if not set)
 */
router.get("/", getMyAccount);

/**
 * PUT /my-account
 * Route to update current user's account information
 * Requires: userId in query parameters, and fields to update in body
 * Returns: Updated user account data
 */
router.put("/", updateMyAccount);

// Export the router to be used in server.js
module.exports = router;
