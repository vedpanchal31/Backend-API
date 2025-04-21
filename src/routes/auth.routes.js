const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  register,
  verifyEmail,
  resendEmail,
  signIn,
  forgotPassword,
  verifyOTP,
  resetPassword,
  logout,
} = require("../controllers/auth.controller");

// Public routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/sign-in", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.post("/resend-email", authMiddleware, resendEmail);
router.post("/logout", authMiddleware, logout);

module.exports = router;
