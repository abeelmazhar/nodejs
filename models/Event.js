/**
 * Event Model
 * Defines the schema and model for Event documents in MongoDB
 */

const mongoose = require("mongoose");

/**
 * Event Schema
 * Defines the structure of an event document in the database
 */
const eventSchema = new mongoose.Schema(
  {
    // Sequential event ID (1, 2, 3, 4, ...)
    eventId: {
      type: Number,
      unique: true, // Ensure no duplicate IDs
      sparse: true, // Allow null values during creation
    },

    // Event title
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    // Event description
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },

    // Event date
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },

    // Event location
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters"],
    },

    // Event image URL or path
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },

    // Time slots/intervals for the event (e.g., [{id_event_date: 1, start: "15:00", end: "16:00"}, {id_event_date: 2, start: "18:00", end: "19:00"}])
    // id_event_date is globally unique across all events (1, 2, 3, 4, 5, 6, ...)
    timeSlots: [
      {
        id_event_date: {
          type: Number,
          required: true,
          // Globally unique sequential ID for each time slot across all events (1, 2, 3, 4, 5, 6, ...)
        },
        start: {
          type: String,
          required: true,
          trim: true,
          // Format: "HH:mm" (24-hour format, e.g., "15:00" for 3 PM)
        },
        end: {
          type: String,
          required: true,
          trim: true,
          // Format: "HH:mm" (24-hour format, e.g., "16:00" for 4 PM)
        },
      },
    ],
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Helper function to get the next sequential event ID
 * Finds the maximum eventId in the database and returns the next number
 */
eventSchema.statics.getNextId = async function () {
  try {
    // Find the event with the highest eventId
    const lastEvent = await this.findOne().sort({ eventId: -1 });

    // If no events exist, start from 1
    if (!lastEvent || !lastEvent.eventId) {
      return 1;
    }

    // Return the next sequential ID
    return lastEvent.eventId + 1;
  } catch (error) {
    // If error occurs, start from 1
    console.error("Error getting next event ID:", error);
    return 1;
  }
};

/**
 * Helper function to get the next global time slot ID (id_event_date)
 * Finds the maximum id_event_date across all events and returns the next number
 * This ensures globally unique IDs for time slots (1, 2, 3, 4, 5, 6, ...)
 */
eventSchema.statics.getNextTimeSlotId = async function () {
  try {
    // Find all events and get the maximum id_event_date from all time slots
    const events = await this.find({
      "timeSlots.id_event_date": { $exists: true },
    });

    let maxId = 0;

    // Loop through all events and find the maximum id_event_date
    events.forEach((event) => {
      if (event.timeSlots && event.timeSlots.length > 0) {
        event.timeSlots.forEach((slot) => {
          if (slot.id_event_date && slot.id_event_date > maxId) {
            maxId = slot.id_event_date;
          }
        });
      }
    });

    // Return the next sequential ID
    return maxId + 1;
  } catch (error) {
    // If error occurs, start from 1
    console.error("Error getting next time slot ID:", error);
    return 1;
  }
};

/**
 * Create and export the Event model
 * 'Event' is the collection name (MongoDB will pluralize it to 'events')
 */
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
