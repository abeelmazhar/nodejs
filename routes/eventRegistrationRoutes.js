/**
 * Event Registration Routes
 * Defines routes for event registration
 */

const express = require("express");
const router = express.Router();

// Import event registration controller functions
const {
  registerForEvent,
  getMyEvents,
  unregisterFromEvent,
} = require("../controllers/eventRegistrationController");

/**
 * POST /event-register/
 * Route to register a user for an event
 * Requires: userId and eventId in request body
 * Returns: Registration data on success
 */
router.post("/", registerForEvent);

/**
 * DELETE /event-register/
 * Route to unregister a user from an event
 * Requires: userId and eventId in request body
 * Returns: Success message on successful unregistration
 */
router.delete("/", unregisterFromEvent);

/**
 * GET /my-events/
 * Route to get all events where user is registered
 * Requires: userId in query parameters
 * Returns: Array of events where user is registered
 */
router.get("/", getMyEvents);

// Export the router to be used in server.js
module.exports = router;
