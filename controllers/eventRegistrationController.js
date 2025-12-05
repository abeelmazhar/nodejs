/**
 * Event Registration Controller
 * Handles event registration operations
 */

const EventRegistration = require("../models/EventRegistration");
const Event = require("../models/Event");
const mongoose = require("mongoose");

/**
 * Register User for Event
 * Registers a user for an event
 * A user can only register to one event per date
 *
 * @route   POST /event-register/
 * @access  Public
 * @returns {Object} Response with success status and registration data
 */
const registerForEvent = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection not available",
        error:
          "Please wait a moment and try again. The database is connecting.",
      });
    }

    // Check if request body exists
    if (
      !req.body ||
      (typeof req.body === "object" && Object.keys(req.body).length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing",
        error: "Please send userId and eventId in the request body",
      });
    }

    // Extract user ID and event ID from request
    const { userId, eventId } = req.body;

    // Validation: Check if all required fields are provided
    const errors = {};

    // Validate userId
    if (!userId) {
      errors.userId = "User ID is required";
    } else {
      const userIdNumber = parseInt(userId);
      if (isNaN(userIdNumber) || userIdNumber <= 0) {
        errors.userId = "Please provide a valid numeric user ID";
      }
    }

    // Validate eventId
    if (!eventId) {
      errors.eventId = "Event ID is required";
    } else {
      const eventIdNumber = parseInt(eventId);
      if (isNaN(eventIdNumber) || eventIdNumber <= 0) {
        errors.eventId = "Please provide a valid numeric event ID";
      }
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    const userIdNumber = parseInt(userId);
    const eventIdNumber = parseInt(eventId);

    // Check if event exists
    const event = await Event.findOne({ id: eventIdNumber });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        error: "No event found with the provided event ID",
      });
    }

    // Check if user is already registered for this specific event
    const existingRegistration = await EventRegistration.findOne({
      userId: userIdNumber,
      eventId: eventIdNumber,
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "Already registered",
        error: "You are already registered for this event",
      });
    }

    // Check if user is already registered for another event on the same date
    // Get the event date
    const eventDate = new Date(event.eventDate);
    const startOfDay = new Date(eventDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(eventDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find if user has any registration on the same date
    const sameDateRegistration = await EventRegistration.findOne({
      userId: userIdNumber,
      eventDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (sameDateRegistration) {
      return res.status(409).json({
        success: false,
        message: "Already registered for this date",
        error:
          "You can only register for one event per date. You are already registered for an event on this date.",
      });
    }

    // Get the next sequential ID
    const nextId = await EventRegistration.getNextId();

    // Create new registration
    const newRegistration = new EventRegistration({
      id: nextId,
      userId: userIdNumber,
      eventId: eventIdNumber,
      eventDate: eventDate,
    });

    // Save registration to database
    await newRegistration.save();

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Successfully registered for event",
      data: {
        id: newRegistration.id,
        userId: newRegistration.userId,
        eventId: newRegistration.eventId,
        eventDate: newRegistration.eventDate,
        createdAt: newRegistration.createdAt,
      },
    });
  } catch (error) {
    // Handle different types of errors

    // MongoDB duplicate key error (if unique constraint fails)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Already registered",
        error: "You are already registered for this event",
      });
    }

    // MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

/**
 * Get My Events
 * Retrieves all events where the user is registered
 *
 * @route   GET /my-events/
 * @access  Public
 * @returns {Object} Response with all events where user is registered
 */
const getMyEvents = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection not available",
        error:
          "Please wait a moment and try again. The database is connecting.",
      });
    }

    // Extract user ID from query parameters
    const { userId } = req.query;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        error: "Please provide userId in query parameters",
      });
    }

    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: "Please provide a valid numeric user ID (1, 2, 3, ...)",
      });
    }

    // Find all registrations for this user
    const registrations = await EventRegistration.find({
      userId: userIdNumber,
    }).sort({ createdAt: -1 }); // Sort by registration date (newest first)

    // If no registrations found
    if (registrations.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No events found",
        count: 0,
        data: [],
      });
    }

    // Get all event IDs from registrations
    const eventIds = registrations.map((reg) => reg.eventId);

    // Find all events where user is registered
    const events = await Event.find({ id: { $in: eventIds } }).sort({
      eventDate: 1,
    }); // Sort by event date (upcoming first)

    // Create a map of eventId to registration for quick lookup
    const registrationMap = {};
    registrations.forEach((reg) => {
      registrationMap[reg.eventId] = reg;
    });

    // Get base URL for images
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const path = require("path");

    // Return events with full image URLs, eventId, and userId
    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      count: events.length,
      data: events.map((event) => {
        // Get registration info for this event
        const registration = registrationMap[event.id];

        // Construct full URL for image
        const imageUrl = event.image.startsWith("http")
          ? event.image
          : `${baseUrl}/uploads/${path.basename(event.image)}`;

        return {
          id: event.id,
          eventId: event.id, // Add eventId
          userId: registration ? registration.userId : userIdNumber, // Add userId
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          location: event.location,
          image: imageUrl, // Return full URL
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        };
      }),
    });
  } catch (error) {
    // Generic server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

/**
 * Unregister from Event
 * Removes a user's registration from an event
 *
 * @route   DELETE /event-register/
 * @access  Public
 * @returns {Object} Response with success status
 */
const unregisterFromEvent = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection not available",
        error:
          "Please wait a moment and try again. The database is connecting.",
      });
    }

    // Check if request body exists
    if (
      !req.body ||
      (typeof req.body === "object" && Object.keys(req.body).length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing",
        error: "Please send userId and eventId in the request body",
      });
    }

    // Extract user ID and event ID from request
    const { userId, eventId } = req.body;

    // Validation: Check if all required fields are provided
    const errors = {};

    // Validate userId
    if (!userId) {
      errors.userId = "User ID is required";
    } else {
      const userIdNumber = parseInt(userId);
      if (isNaN(userIdNumber) || userIdNumber <= 0) {
        errors.userId = "Please provide a valid numeric user ID";
      }
    }

    // Validate eventId
    if (!eventId) {
      errors.eventId = "Event ID is required";
    } else {
      const eventIdNumber = parseInt(eventId);
      if (isNaN(eventIdNumber) || eventIdNumber <= 0) {
        errors.eventId = "Please provide a valid numeric event ID";
      }
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    const userIdNumber = parseInt(userId);
    const eventIdNumber = parseInt(eventId);

    // Check if event exists
    const event = await Event.findOne({ id: eventIdNumber });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        error: "No event found with the provided event ID",
      });
    }

    // Check if registration exists
    const registration = await EventRegistration.findOne({
      userId: userIdNumber,
      eventId: eventIdNumber,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
        error: "You are not registered for this event",
      });
    }

    // Delete the registration
    await EventRegistration.findOneAndDelete({
      userId: userIdNumber,
      eventId: eventIdNumber,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Successfully unregistered from event",
      data: {
        userId: userIdNumber,
        eventId: eventIdNumber,
      },
    });
  } catch (error) {
    // Handle different types of errors

    // MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

// Export the controller functions
module.exports = {
  registerForEvent,
  getMyEvents,
  unregisterFromEvent,
};
