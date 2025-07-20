const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { getAllUsers } = require("./controllers/getAllUsers");

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // Middleware to parse JSON

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", authRoutes);
app.get("/", getAllUsers);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
