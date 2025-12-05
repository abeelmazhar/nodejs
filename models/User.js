/**
 * User Model
 * Defines the schema and model for User documents in MongoDB
 */

const mongoose = require("mongoose");

/**
 * User Schema
 * Defines the structure of a user document in the database
 */
const userSchema = new mongoose.Schema(
  {
    // Sequential user ID (1, 2, 3, 4, ...)
    id: {
      type: Number,
      unique: true, // Ensure no duplicate IDs
      sparse: true, // Allow null values during creation
    },

    // User's full name
    name: {
      type: String,
      required: [true, "Name is required"], // Custom error message
      trim: true, // Removes whitespace from both ends
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [10, "Name cannot exceed 10 characters"],
    },

    // User's email address
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensures no duplicate emails in database
      lowercase: true, // Converts email to lowercase before saving
      trim: true,
      // Email validation using regex pattern
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    // User's password (will be hashed before saving)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [4, "Password must be at least 4 characters"],
      // Don't include password in JSON responses by default
      select: false, // This prevents password from being returned in queries unless explicitly requested
    },

    // User's phone number
    phone: {
      type: String,
      default: null, // Optional field, defaults to null if not provided
      trim: true,
    },

    // City ID (reference to city)
    city: {
      type: String, // Storing city ID as string
      default: null, // Optional field, defaults to null if not provided
      trim: true,
    },

    // User's school name
    school: {
      type: String,
      default: null, // Optional field, defaults to null if not provided
      trim: true,
    },

    // User's class/grade
    class: {
      type: String,
      default: null, // Optional field, defaults to null if not provided
      trim: true,
    },

    // User's profile image URL or path
    image: {
      type: String,
      default: null, // Optional field, defaults to null if not provided
      trim: true,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Helper function to get the next sequential ID
 * Finds the maximum ID in the database and returns the next number
 */
userSchema.statics.getNextId = async function () {
  try {
    // Find the user with the highest ID
    const lastUser = await this.findOne().sort({ id: -1 });

    // If no users exist, start from 1
    if (!lastUser || !lastUser.id) {
      return 1;
    }

    // Return the next sequential ID
    return lastUser.id + 1;
  } catch (error) {
    // If error occurs, start from 1
    console.error("Error getting next ID:", error);
    return 1;
  }
};

/**
 * Create and export the User model
 * 'User' is the collection name (MongoDB will pluralize it to 'users')
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
