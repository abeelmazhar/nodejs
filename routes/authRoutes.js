const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const { getAllUsers } = require("../controllers/getAllUsers");
const { deleteUser } = require("../controllers/deleteUser");
const { updateUser } = require("../controllers/updateUser");

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", updateUser);
module.exports = router;
