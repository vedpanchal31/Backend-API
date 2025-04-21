const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} = require("../controllers/user.controller");

// Protected routes - all require authentication
router.get("/profile", authMiddleware, getUserProfile);
router.patch("/profile", authMiddleware, updateUserProfile);
router.delete("/profile", authMiddleware, deleteUserAccount);

module.exports = router;
