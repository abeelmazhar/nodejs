const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
const connectDB = require("./config/db");
const sessionRoutes = require("./routes/sessionRoutes");
const authRoutes = require("./routes/authRoutes");
const informationRoutes = require("./routes/informationRoutes");
const userRoutes = require("./routes/userRoutes");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express application
const app = express();

// Configure multer for parsing multipart/form-data
// This handles form-data from Postman's "form-data" tab
const upload = multer();

// Middleware to parse form-data (multipart/form-data)
// This allows us to access req.body when using form-data in Postman
app.use(upload.any());

// Middleware to parse URL-encoded request bodies (application/x-www-form-urlencoded)
// This handles form data from Postman's "x-www-form-urlencoded" tab
// extended: true allows parsing of rich objects and arrays
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root route - health check endpoint
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Session routes
// All routes defined in sessionRoutes.js will be prefixed with /session
app.use("/session", sessionRoutes);

// Authentication routes
// All routes defined in authRoutes.js will be prefixed with /auth
app.use("/auth", authRoutes);

// Save information routes
// All routes defined in informationRoutes.js will be prefixed with /save-information
app.use("/save-information", informationRoutes);

// User account routes
// All routes defined in userRoutes.js will be prefixed with /my-account
app.use("/my-account", userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
