/**
 * Authentication Middleware
 * Protects routes by verifying JWT access tokens
 */

const jwtService = require("../utils/jwtService");
const User = require("../models/User");

/**
 * Middleware to authenticate requests using JWT access token
 * Adds user information to req.user if token is valid
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "No token provided. Please include a valid access token in the Authorization header.",
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "Token is missing. Please provide a valid access token.",
      });
    }

    // Check if token is blacklisted (logout)
    const tokenBlacklist = require("../utils/tokenBlacklist");
    if (tokenBlacklist.isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
        error: "This token has been logged out. Please login again.",
      });
    }

    // Verify the access token
    const decoded = jwtService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: "The access token is invalid or has expired. Please login again or refresh your token.",
      });
    }

    // Find user by ID from token
    const user = await User.findOne({ id: parseInt(decoded.userId) });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        error: "The user associated with this token no longer exists.",
      });
    }

    // Attach user information to request object
    // This makes user data available in protected route handlers
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: "An error occurred during authentication. Please try again.",
    });
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if token is missing, but adds user if token is valid
 * Useful for routes that work with or without authentication
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwtService.verifyAccessToken(token);

      if (decoded) {
        const user = await User.findOne({ id: parseInt(decoded.userId) });
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      }
    }

    // Always continue, even if no token provided
    next();
  } catch (error) {
    // On error, just continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};

