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
  searchEvents,
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
 * GET /events/search
 * Route to search and filter events
 * Query Parameters (optional):
 *   - search: Search term for title (case-insensitive partial match)
 *   - location: Filter by exact location match
 *   - dateFrom: Filter events from this date onwards (YYYY-MM-DD format)
 *   - dateTo: Filter events up to this date (YYYY-MM-DD format)
 *   - sortBy: Sort field (eventDate, createdAt, title) - default: createdAt
 *   - sortOrder: Sort direction (asc, desc) - default: desc
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 * Returns: Filtered and paginated events with metadata
 * Example: GET /events/search?search=workshop&location=New York&dateFrom=2024-01-01&sortBy=eventDate&sortOrder=asc&page=1&limit=10
 */
router.get("/search", searchEvents);

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
