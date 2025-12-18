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
 * Route to get all events with pagination
 * Query Parameters (optional):
 *   - page: Page number (default: 1, minimum: 1)
 *   - limit: Items per page (default: 10, minimum: 1, maximum: 100)
 * Returns: Paginated events with metadata
 * Example: GET /events?page=1&limit=10
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
