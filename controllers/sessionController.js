/**
 * Session Controller
 * Handles all session-related operations
 */

const crypto = require("crypto");

/**
 * Start a new session
 * Generates a unique session ID and returns it
 *
 */
const startSession = async (req, res) => {
  try {
    // Generate a random 32-character hexadecimal session ID
    // Using crypto.randomBytes for cryptographically secure random generation
    // 16 bytes = 32 hex characters (each byte = 2 hex chars)
    const sessionId = crypto.randomBytes(16).toString("hex");

    // Return success response with the generated session ID
    return res.status(200).json({
      success: true,
      data: sessionId,
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error starting session:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start session",
    });
  }
};

// Export the controller functions
module.exports = {
  startSession,
};
