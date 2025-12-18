/**
 * Event Controller
 * Handles all event-related operations
 */

const Event = require("../models/Event");
const mongoose = require("mongoose");
const path = require("path");

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
    const { title, description, eventDate, location, timeSlots } = req.body;

    // Handle image: can be a file upload (req.files) or a URL/path (req.body.image)
    // When using form-data with file upload, multer puts files in req.files array
    let image = req.body.image; // Try to get from body first (for URL/path)

    // Check if image was uploaded as a file
    if (req.files && req.files.length > 0) {
      // Find the file with fieldname 'image'
      const imageFile = req.files.find((file) => file.fieldname === "image");
      if (imageFile) {
        // Get base URL from request (protocol + host)
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        // Construct full URL for the uploaded image
        image = `${baseUrl}/uploads/${imageFile.filename}`;
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

    // Validate and parse time slots
    let parsedTimeSlots = [];
    if (!timeSlots) {
      errors.timeSlots = "Time slots are required";
    } else {
      try {
        // Parse time slots if it's a JSON string
        let slots = timeSlots;
        if (typeof timeSlots === "string") {
          slots = JSON.parse(timeSlots);
        }

        // Ensure it's an array
        if (!Array.isArray(slots)) {
          errors.timeSlots = "Time slots must be an array";
        } else if (slots.length === 0) {
          errors.timeSlots = "At least one time slot is required";
        } else {
          // Validate each time slot
          slots.forEach((slot, index) => {
            if (!slot.start || !slot.end) {
              errors[`timeSlots[${index}]`] =
                "Each time slot must have start and end time";
            } else {
              // Validate time format (HH:mm)
              const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
              if (!timeRegex.test(slot.start)) {
                errors[`timeSlots[${index}].start`] =
                  "Start time must be in HH:mm format (e.g., 15:00)";
              }
              if (!timeRegex.test(slot.end)) {
                errors[`timeSlots[${index}].end`] =
                  "End time must be in HH:mm format (e.g., 16:00)";
              }
              // Validate that end time is after start time
              if (timeRegex.test(slot.start) && timeRegex.test(slot.end)) {
                const [startHour, startMin] = slot.start.split(":").map(Number);
                const [endHour, endMin] = slot.end.split(":").map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
                if (endMinutes <= startMinutes) {
                  errors[`timeSlots[${index}]`] =
                    "End time must be after start time";
                }
              }
            }
          });
          // Assign globally unique sequential IDs to each time slot (1, 2, 3, 4, 5, 6, ...)
          // Get the current maximum id_event_date across all events
          let currentMaxId = (await Event.getNextTimeSlotId()) - 1;

          // Assign globally unique IDs starting from the next available ID
          parsedTimeSlots = slots.map((slot, index) => ({
            id_event_date: currentMaxId + index + 1, // Assign globally unique ID
            start: slot.start.trim(),
            end: slot.end.trim(),
          }));
        }
      } catch (parseError) {
        errors.timeSlots =
          "Invalid time slots format. Expected array of {start: 'HH:mm', end: 'HH:mm'}";
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
      eventId: nextId, // Assign sequential ID
      title: title.trim(),
      description: description.trim(),
      eventDate: new Date(eventDate), // Convert to Date object
      location: location.trim(),
      image: image.trim(),
      timeSlots: parsedTimeSlots, // Add time slots
    });

    // Save event to database
    await newEvent.save();

    // Get base URL for image
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = newEvent.image.startsWith("http")
      ? newEvent.image
      : `${baseUrl}/uploads/${path.basename(newEvent.image)}`;

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        eventId: newEvent.eventId, // Return sequential ID
        title: newEvent.title,
        description: newEvent.description,
        eventDate: newEvent.eventDate,
        location: newEvent.location,
        image: imageUrl, // Return full URL
        timeSlots: newEvent.timeSlots, // Return time slots
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
/**
 * Get All Events with Pagination
 * Retrieves events with pagination support
 * Supports query parameters: page, limit
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

    // Extract and validate pagination parameters from query string
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 1; // Default to 10 items per page
    const maxLimit = 100; // Maximum items per page to prevent abuse

    // Validate page number
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: "Page number must be greater than 0",
      });
    }

    // Validate and limit the limit parameter
    const validLimit = Math.min(Math.max(1, limit), maxLimit); // Between 1 and maxLimit

    // Calculate skip value (how many documents to skip)
    const skip = (page - 1) * validLimit;

    // Get total count of events (for pagination metadata)
    const totalEvents = await Event.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalEvents / validLimit);

    // Validate page number against total pages
    if (page > totalPages && totalPages > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number",
        error: `Page ${page} does not exist. Total pages: ${totalPages}`,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalEvents,
          itemsPerPage: validLimit,
        },
      });
    }

    // Find events with pagination and sort by creation date (newest first)
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(validLimit);

    // Get base URL for images
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Format events with full image URLs
    const formattedEvents = events.map((event) => {
      // Construct full URL for image
      const imageUrl = event.image.startsWith("http")
        ? event.image
        : `${baseUrl}/uploads/${path.basename(event.image)}`;

      return {
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        location: event.location,
        image: imageUrl, // Return full URL
        timeSlots: event.timeSlots || [], // Return time slots
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };
    });

    // Return paginated events with metadata
    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: {
        events: formattedEvents,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalEvents,
          itemsPerPage: validLimit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    // Generic server error
    console.error("Error fetching events:", error);
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
    const event = await Event.findOne({ eventId: eventIdNumber });

    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        error: "No event found with the provided ID",
      });
    }

    // Get base URL for image
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = event.image.startsWith("http")
      ? event.image
      : `${baseUrl}/uploads/${path.basename(event.image)}`;

    // Return event data with full image URL
    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: {
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        location: event.location,
        image: imageUrl, // Return full URL
        timeSlots: event.timeSlots || [], // Return time slots
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

/**
 * Delete Event
 * Deletes an event by its ID
 * Also deletes all registrations associated with this event
 *
 * @route   DELETE /events/:id or DELETE /events/?id=1
 * @access  Public
 * @returns {Object} Response with success status
 */
const deleteEvent = async (req, res) => {
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

    // Extract event ID from URL parameters or query parameters
    // Supports both: /events/1 or /events/?id=1
    const id = req.params.id || req.query.id;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
        error:
          "Please provide event ID in URL path (/events/:id) or query parameter (?id=1)",
      });
    }

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
    const event = await Event.findOne({ eventId: eventIdNumber });

    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        error: "No event found with the provided ID",
      });
    }

    // Import EventRegistration model to delete associated registrations
    const EventRegistration = require("../models/EventRegistration");

    // Delete all registrations associated with this event
    await EventRegistration.deleteMany({ eventId: eventIdNumber });

    // Delete the event
    await Event.findOneAndDelete({ eventId: eventIdNumber });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: {
        id: eventIdNumber,
        deletedRegistrations: true, // Indicates registrations were also deleted
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
  deleteEvent,
};
