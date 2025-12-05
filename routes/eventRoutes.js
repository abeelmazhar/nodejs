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
  deleteEvent,
} = require("../controllers/eventController");

/**
 * GET /events
 * Route to get all events
 * Returns: Array of all events
 */
router.get("/", getAllEvents);

/**
 * DELETE /events/
 * Route to delete an event by ID (using query parameter)
 * Requires: event ID in query parameters (?id=1)
 * Returns: Success message
 * Note: Also deletes all registrations associated with this event
 */
router.delete("/", deleteEvent);

/**
 * GET /events/:id
 * Route to get a specific event by ID
 * Requires: event ID in URL parameters
 * Returns: Event data
 */
router.get("/:id", getEventById);

/**
 * DELETE /events/:id
 * Route to delete an event by ID
 * Requires: event ID in URL parameters
 * Returns: Success message
 * Note: Also deletes all registrations associated with this event
 */
router.delete("/:id", deleteEvent);

// Export the router to be used in server.js
module.exports = router;
