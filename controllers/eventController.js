/**
 * Event Controller
 * Handles all event-related operations
 */

const Event = require("../models/Event");
const mongoose = require("mongoose");

/**
 * Create Event
 * Creates a new event with title, description, event date, location, and image
 *
 */
const createEvent = async (req, res) => {
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
        error: "Please send all required fields in the request body",
      });
    }

    // Extract all required fields from request
    const { title, description, eventDate, location } = req.body;

    // Handle image: can be a file upload (req.files) or a URL/path (req.body.image)
    // When using form-data with file upload, multer puts files in req.files array
    let image = req.body.image; // Try to get from body first (for URL/path)

    // Check if image was uploaded as a file
    if (req.files && req.files.length > 0) {
      // Find the file with fieldname 'image'
      const imageFile = req.files.find((file) => file.fieldname === "image");
      if (imageFile) {
        // Use the filename or path of the uploaded file
        // In production, you would save this file and use the saved path
        image = imageFile.originalname || imageFile.filename || imageFile.path;
      }
    }

    // Validation: Check if all required fields are provided
    const errors = {};

    // Validate title
    if (!title) {
      errors.title = "Title is required";
    } else if (title.trim().length < 2) {
      errors.title = "Title must be at least 2 characters";
    } else if (title.trim().length > 100) {
      errors.title = "Title cannot exceed 100 characters";
    }

    // Validate description
    if (!description) {
      errors.description = "Description is required";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    // Validate event date
    if (!eventDate) {
      errors.eventDate = "Event date is required";
    } else {
      // Validate date format
      const date = new Date(eventDate);
      if (isNaN(date.getTime())) {
        errors.eventDate = "Please provide a valid event date";
      }
    }

    // Validate location
    if (!location) {
      errors.location = "Location is required";
    } else if (location.trim().length < 2) {
      errors.location = "Location must be at least 2 characters";
    }

    // Validate image
    // Image can be from file upload (req.files) or from body (URL/path)
    if (!image) {
      // Check if image was uploaded as file but not found
      if (req.files && req.files.length > 0) {
        const imageFile = req.files.find((file) => file.fieldname === "image");
        if (!imageFile) {
          errors.image = "Image is required";
        }
      } else {
        errors.image = "Image is required";
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

    // Get the next sequential ID (1, 2, 3, 4, ...)
    const nextId = await Event.getNextId();

    // Create new event document with sequential ID
    const newEvent = new Event({
      id: nextId, // Assign sequential ID
      title: title.trim(),
      description: description.trim(),
      eventDate: new Date(eventDate), // Convert to Date object
      location: location.trim(),
      image: image.trim(),
    });

    // Save event to database
    await newEvent.save();

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        id: newEvent.id, // Return sequential ID
        title: newEvent.title,
        description: newEvent.description,
        eventDate: newEvent.eventDate,
        location: newEvent.location,
        image: newEvent.image,
        createdAt: newEvent.createdAt,
        updatedAt: newEvent.updatedAt,
      },
    });
  } catch (error) {
    // Handle different types of errors

    // MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
      // Extract validation errors from Mongoose
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
 * Get All Events
 * Retrieves all events from the database
 *
 */
const getAllEvents = async (req, res) => {
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

    // Find all events and sort by creation date (newest first)
    const events = await Event.find().sort({ createdAt: -1 });

    // Return all events
    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      count: events.length,
      data: events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        location: event.location,
        image: event.image,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),
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
 * Get Specific Event
 * Retrieves a single event by its ID
 *
 */
const getEventById = async (req, res) => {
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

    // Extract event ID from URL parameters
    const { id } = req.params;

    // Validate if id is a valid number
    const eventIdNumber = parseInt(id);
    if (isNaN(eventIdNumber) || eventIdNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
        error: "Please provide a valid numeric event ID (1, 2, 3, ...)",
      });
    }

    // Find event by sequential ID
    const event = await Event.findOne({ id: eventIdNumber });

    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        error: "No event found with the provided ID",
      });
    }

    // Return event data
    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        location: event.location,
        image: event.image,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
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

// Export the controller functions
module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
};
