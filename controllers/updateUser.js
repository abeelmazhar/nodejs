// controllers/updateUser.js
const mongoose = require("mongoose");
const User = require("../models/User");

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate input
    if (!name && !email) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      // Check if new email is already taken by another user
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      updateData.email = email;
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    ).select("-password"); // Exclude password from the response

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateUser };
