/**
 * Session Routes
 * Defines all routes related to session management
 */

const express = require("express");
const router = express.Router();

// Import session controller functions
const { startSession } = require("../controllers/sessionController");

/**
 * GET /session/start/
 * Route to start a new session
 * Returns a unique session ID
 */
router.get("/start", startSession);

// Export the router to be used in server.js
module.exports = router;
