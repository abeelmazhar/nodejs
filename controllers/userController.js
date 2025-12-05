/**
 * User Controller
 * Handles user account operations like saving user information
 */

const User = require("../models/User");
const mongoose = require("mongoose");
const path = require("path");

/**
 * Save User Information
 * Saves or updates user information (email, phone, city, name, school, class, image)
 * All fields are required
 *
 */
const saveInformation = async (req, res) => {
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

    // Extract user ID and all required fields from request
    const { userId } = req.query;
    const { email, phone, city, name, school, class: userClass } = req.body;

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

    // If userId is not provided, return error
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        error: "Please provide userId in query parameters",
      });
    }

    // Validate if userId is a valid number
    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: "Please provide a valid numeric user ID (1, 2, 3, ...)",
      });
    }

    // Find user by sequential ID
    const user = await User.findOne({ id: userIdNumber });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "No user found with the provided ID",
      });
    }

    // Validation: Check if all required fields are provided
    const errors = {};

    // Validate email
    if (!email) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please provide a valid email address";
      }
    }

    // Validate phone
    if (!phone) {
      errors.phone = "Phone is required";
    }

    // Validate city
    if (!city) {
      errors.city = "City is required";
    }

    // Validate name
    if (!name) {
      errors.name = "Name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 10) {
      errors.name = "Name cannot exceed 10 characters";
    }

    // Validate school
    if (!school) {
      errors.school = "School is required";
    }

    // Validate class
    if (!userClass) {
      errors.class = "Class is required";
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

    // Check if email is already taken by another user (if email is being changed)
    if (email.toLowerCase().trim() !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        id: { $ne: userIdNumber }, // Exclude current user by sequential ID
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
          error: "This email is already taken by another user",
        });
      }
    }

    // Update user with all provided information
    const updatedUser = await User.findOneAndUpdate(
      { id: userIdNumber }, // Find by sequential ID
      {
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        city: city.trim(),
        name: name.trim(),
        school: school.trim(),
        class: userClass.trim(),
        image: image.trim(),
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators
      }
    );

    // Get base URL for image
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = updatedUser.image
      ? updatedUser.image.startsWith("http")
        ? updatedUser.image
        : `${baseUrl}/uploads/${path.basename(updatedUser.image)}`
      : null;

    // Return updated user data
    return res.status(200).json({
      success: true,
      message: "User information saved successfully",
      data: {
        id: updatedUser.id, // Return sequential ID instead of _id
        name: updatedUser.name || null,
        email: updatedUser.email || null,
        phone: updatedUser.phone || null,
        city: updatedUser.city || null,
        school: updatedUser.school || null,
        class: updatedUser.class || null,
        image: imageUrl, // Return full URL
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    // Handle different types of errors

    // MongoDB duplicate key error (if unique constraint fails)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        error: "This email is already taken by another user",
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
 * Get User Account Information
 * Retrieves the current user's account information
 *
 */
const getMyAccount = async (req, res) => {
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

    // Extract user ID from request
    // In a real app, this would come from authentication token/middleware
    // For now, we'll get it from query params
    const { userId } = req.query;

    // If userId is not provided, return error
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        error: "Please provide userId in query parameters",
      });
    }

    // Validate if userId is a valid number
    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: "Please provide a valid numeric user ID (1, 2, 3, ...)",
      });
    }

    // Find user by sequential ID in database
    const user = await User.findOne({ id: userIdNumber });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "No user found with the provided ID",
      });
    }

    // Get base URL for image
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = user.image
      ? user.image.startsWith("http")
        ? user.image
        : `${baseUrl}/uploads/${path.basename(user.image)}`
      : null;

    // Return user account data
    // Return null for fields that don't exist
    return res.status(200).json({
      success: true,
      message: "User account retrieved successfully",
      data: {
        id: user.id, // Return sequential ID instead of _id
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null,
        city: user.city || null,
        school: user.school || null,
        class: user.class || null,
        image: imageUrl, // Return full URL
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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

/**
 * Update User Account Information
 * Updates the current user's account information
 *
 */
const updateMyAccount = async (req, res) => {
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
        error: "Please send data to update in the request body",
      });
    }

    // Extract user ID and update data from request
    const { userId } = req.query;
    const { email, phone, city, name, school, class: userClass } = req.body;

    // Handle image: can be a file upload (req.files) or a URL/path (req.body.image)
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

    // If userId is not provided, return error
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        error: "Please provide userId in query parameters",
      });
    }

    // Validate if userId is a valid number
    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: "Please provide a valid numeric user ID (1, 2, 3, ...)",
      });
    }

    // Find user by sequential ID
    const user = await User.findOne({ id: userIdNumber });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "No user found with the provided ID",
      });
    }

    // Validation: Check email format if email is being updated
    if (email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: "Please provide a valid email address",
        });
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        id: { $ne: userIdNumber }, // Exclude current user by sequential ID
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
          error: "This email is already taken by another user",
        });
      }
    }

    // Validation: Check name length if name is being updated
    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: "Name must be at least 2 characters",
        });
      }
      if (name.trim().length > 10) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: "Name cannot exceed 10 characters",
        });
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (city !== undefined) updateData.city = city ? city.trim() : null;
    if (name !== undefined) updateData.name = name.trim();
    if (school !== undefined) updateData.school = school ? school.trim() : null;
    if (userClass !== undefined)
      updateData.class = userClass ? userClass.trim() : null;
    if (image !== undefined) updateData.image = image ? image.trim() : null;

    // Update user in database
    const updatedUser = await User.findOneAndUpdate(
      { id: userIdNumber }, // Find by sequential ID
      updateData,
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators
      }
    );

    // Get base URL for image
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = updatedUser.image
      ? updatedUser.image.startsWith("http")
        ? updatedUser.image
        : `${baseUrl}/uploads/${path.basename(updatedUser.image)}`
      : null;

    // Return updated user data
    // Return null for fields that don't exist
    return res.status(200).json({
      success: true,
      message: "User account updated successfully",
      data: {
        id: updatedUser.id, // Return sequential ID instead of _id
        name: updatedUser.name || null,
        email: updatedUser.email || null,
        phone: updatedUser.phone || null,
        city: updatedUser.city || null,
        school: updatedUser.school || null,
        class: updatedUser.class || null,
        image: imageUrl, // Return full URL
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    // Handle different types of errors

    // MongoDB duplicate key error (if unique constraint fails)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        error: "This email is already taken by another user",
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

// Export the controller functions
module.exports = {
  saveInformation,
  getMyAccount,
  updateMyAccount,
};
