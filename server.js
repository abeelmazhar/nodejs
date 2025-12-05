const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const sessionRoutes = require("./routes/sessionRoutes");
const authRoutes = require("./routes/authRoutes");
const informationRoutes = require("./routes/informationRoutes");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const createEventRoutes = require("./routes/createEventRoutes");
const eventRegistrationRoutes = require("./routes/eventRegistrationRoutes");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express application
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer to save files to disk
// This saves uploaded images to the uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to uploads directory
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + original filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Middleware to parse form-data (multipart/form-data)
// This allows us to access req.body when using form-data in Postman
app.use(upload.any());

// Serve static files from uploads directory
// This allows images to be accessed via URL like: http://localhost:5000/uploads/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/session/", sessionRoutes);

// Authentication routes
// All routes defined in authRoutes.js will be prefixed with /auth
app.use("/auth/", authRoutes);

// Save information routes
// All routes defined in informationRoutes.js will be prefixed with /save-information
app.use("/save-information/", informationRoutes);

// User account routes
// All routes defined in userRoutes.js will be prefixed with /my-account
app.use("/my-account/", userRoutes);

// Create event route
// Route for creating events, prefixed with /create-event
app.use("/create-event/", createEventRoutes);

// Event routes
// All routes defined in eventRoutes.js will be prefixed with /events
app.use("/events/", eventRoutes);

// Event registration routes
// All routes defined in eventRegistrationRoutes.js will be prefixed with /event-register
app.use("/event-register/", eventRegistrationRoutes);

// My events routes
// Route to get events where user is registered
app.use("/my-events/", eventRegistrationRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
