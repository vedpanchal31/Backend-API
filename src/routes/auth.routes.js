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
router.post("/auth/register", register);
router.post("/auth/verify-email", verifyEmail);
router.post("/auth/sign-in", signIn);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/verify-otp", verifyOTP);
router.post("/auth/reset-password/:token", resetPassword);

// Protected routes
router.post("/auth/resend-email", authMiddleware, resendEmail);
router.post("/auth/logout", authMiddleware, logout);

module.exports = router;
