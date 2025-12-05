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
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Create and export the User model
 * 'User' is the collection name (MongoDB will pluralize it to 'users')
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
