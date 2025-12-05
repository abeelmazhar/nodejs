/**
 * Event Routes
 * Defines all routes related to event management
 */

const express = require("express");
const router = express.Router();

// Import event controller functions
const {
  createEvent,
  getAllEvents,
  getEventById,
} = require("../controllers/eventController");

/**
 * GET /events
 * Route to get all events
 * Returns: Array of all events
 */
router.get("/", getAllEvents);

/**
 * GET /events/:id
 * Route to get a specific event by ID
 * Requires: event ID in URL parameters
 * Returns: Event data
 */
router.get("/:id", getEventById);

// Export the router to be used in server.js
module.exports = router;
