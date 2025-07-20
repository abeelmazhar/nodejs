const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const { getAllUsers } = require("../controllers/getAllUsers");

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", getAllUsers);

module.exports = router;
