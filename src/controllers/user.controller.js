const User = require("../models/user.model");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    console.log("Looking for user with ID:", req.user.userId);
    const user = await User.findById(req.user.userId).select("-password -__v");
    console.log("Found user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    console.log("Updating user with ID:", req.user.userId);
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    // Check if userName is already in use
    const existingUser = await User.findOne({
      userName,
      _id: { $ne: req.user.userId },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username is already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { userName } },
      { new: true, runValidators: true }
    ).select("-password -__v");

    console.log("Updated user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    console.log("Deleting user with ID:", req.user.userId);
    const user = await User.findByIdAndDelete(req.user.userId);
    console.log("Deleted user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUserAccount:", error);
    res
      .status(500)
      .json({ message: "Error deleting account", error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
};
