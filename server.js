const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const sessionRoutes = require("./routes/sessionRoutes");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express application
const app = express();

// Middleware to parse JSON request bodies
// This allows us to access req.body in our controllers
app.use(express.json());

// Middleware to parse URL-encoded request bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Root route - health check endpoint
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Session routes
// All routes defined in sessionRoutes.js will be prefixed with /session
app.use("/session", sessionRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
