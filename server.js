const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // Middleware to parse JSON

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", userRoutes); // Mount the user routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
