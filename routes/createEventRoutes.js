/**
 * Create Event Routes
 * Defines route for creating events
 */

const express = require("express");
const router = express.Router();

// Import authentication middleware
const { authenticate } = require("../middleware/authMiddleware");

// Import event controller functions
const { createEvent } = require("../controllers/eventController");

/**
 * POST /create-event/
 * Route to create a new event
 * Requires: Authorization header with Bearer token, and title, description, eventDate, location, image in request body
 * Returns: Event data with sequential ID on success
 */
router.post("/", authenticate, createEvent);

// Export the router to be used in server.js
module.exports = router;
