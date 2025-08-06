const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateTokens = require("../utils/generateTokens");

// Signup controller
const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const errors = {};

  // if (!name) errors.name = "Name is required";
  // if (!email) errors.email = "Email is required";
  // if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Invalid email";
  // if (!password) errors.password = "Password is required";
  // if (password && password.length < 6)
  //   errors.password = "Password must be at least 6 characters";

  // if (Object.keys(errors).length > 0) {
  //   return res.status(400).json({ errors });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({
      message: "User registered",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Login controller
const login = async (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "USER NOT FOUND" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login };
