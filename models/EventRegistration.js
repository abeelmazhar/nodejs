/**
 * Event Registration Model
 * Defines the schema and model for tracking user event registrations
 */

const mongoose = require("mongoose");

/**
 * Event Registration Schema
 * Tracks which users have registered for which events
 */
const eventRegistrationSchema = new mongoose.Schema(
  {
    // Sequential registration ID (1, 2, 3, 4, ...)
    id: {
      type: Number,
      unique: true, // Ensure no duplicate IDs
      sparse: true, // Allow null values during creation
    },

    // User ID (sequential ID from User model)
    userId: {
      type: Number,
      required: [true, "User ID is required"],
      index: true, // Index for faster queries
    },

    // Event ID (sequential ID from Event model)
    eventId: {
      type: Number,
      required: [true, "Event ID is required"],
      index: true, // Index for faster queries
    },

    // Event date (to check for same date registrations)
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      index: true, // Index for faster queries
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Compound index to ensure a user can only register once per event
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

/**
 * Helper function to get the next sequential ID
 * Finds the maximum ID in the database and returns the next number
 */
eventRegistrationSchema.statics.getNextId = async function () {
  try {
    // Find the registration with the highest ID
    const lastRegistration = await this.findOne().sort({ id: -1 });

    // If no registrations exist, start from 1
    if (!lastRegistration || !lastRegistration.id) {
      return 1;
    }

    // Return the next sequential ID
    return lastRegistration.id + 1;
  } catch (error) {
    // If error occurs, start from 1
    console.error("Error getting next registration ID:", error);
    return 1;
  }
};

/**
 * Create and export the EventRegistration model
 * 'EventRegistration' is the collection name (MongoDB will pluralize it to 'eventregistrations')
 */
const EventRegistration = mongoose.model(
  "EventRegistration",
  eventRegistrationSchema
);

module.exports = EventRegistration;
