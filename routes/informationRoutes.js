/**
 * Information Routes
 * Defines routes for saving user information
 */

const express = require("express");
const router = express.Router();

// Import user controller functions
const { saveInformation } = require("../controllers/userController");

/**
 * POST /save-information/
 * Route to save user information
 * Requires: userId in query parameters, and all fields (email, phone, city, name, school, class, image) in body
 * Returns: User data with all information
 */
router.post("/", saveInformation);

// Export the router to be used in server.js
module.exports = router;
