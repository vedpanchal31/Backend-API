const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const {
  registerSchema,
  verifyEmailSchema,
  resendEmailSchema,
  signInSchema,
  forgotPasswordSchema,
  verifyOTPSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");
const { sendOTPEmail } = require("../utils/email.service");
const Token = require("../models/token.model");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { userName: validatedData.userName },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Create new user
    const user = new User({
      userName: validatedData.userName,
      email: validatedData.email,
      password: hashedPassword,
      otp: {
        code: otp,
        expiresAt: otpExpiresAt,
      },
    });

    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, otp);
    if (!emailSent) {
      return res.status(500).json({
        message: "Error sending verification email",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = verifyOTPSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({
        message: "No OTP found for this user",
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();

    res.json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resendEmail = async (req, res) => {
  try {
    const { email, type } = resendEmailSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Handle email verification OTP (type 1)
    if (type === 1) {
      if (user.isEmailVerified) {
        return res.status(400).json({
          message: "Email already verified",
        });
      }

      // Generate new OTP
      const newOtp = generateOTP();
      const otpExpiresAt = new Date();
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // OTP expires in 10 minutes

      // Update user with new OTP
      user.otp = {
        code: newOtp,
        expiresAt: otpExpiresAt,
      };
      await user.save();

      // Send new OTP email
      const emailSent = await sendOTPEmail(user.email, newOtp);
      if (!emailSent) {
        return res.status(500).json({
          message: "Failed to send verification email. Please try again later.",
          error: "Email service error",
        });
      }

      return res.json({
        message: "New verification OTP sent successfully",
        user: {
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      });
    }

    // Handle forgot password OTP (type 2)
    if (type === 2) {
      // Generate new OTP
      const newOtp = generateOTP();
      const otpExpiresAt = new Date();
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // OTP expires in 10 minutes

      // Update user with new OTP
      user.otp = {
        code: newOtp,
        expiresAt: otpExpiresAt,
      };
      await user.save();

      // Send new OTP email
      const emailSent = await sendOTPEmail(user.email, newOtp);
      if (!emailSent) {
        return res.status(500).json({
          message:
            "Failed to send password reset email. Please try again later.",
          error: "Email service error",
        });
      }

      return res.json({
        message: "Password reset OTP sent successfully",
        user: {
          id: user._id,
          email: user.email,
        },
      });
    }

    // If type is neither 1 nor 2, return error
    return res.status(400).json({
      message:
        "Invalid request type. Use type 1 for email verification or type 2 for password reset.",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = signInSchema.parse(req.body);

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate new OTP
      const newOtp = generateOTP();
      const otpExpiresAt = new Date();
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 2); // OTP expires in 2 minutes

      // Update user with new OTP
      user.otp = {
        code: newOtp,
        expiresAt: otpExpiresAt,
      };
      await user.save();

      // Send verification email
      const emailSent = await sendOTPEmail(user.email, newOtp);
      if (!emailSent) {
        return res.status(500).json({
          message: "Error sending verification email",
        });
      }

      return res.status(403).json({
        message: "Email not verified. A new verification OTP has been sent.",
        user: {
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      userName: user.userName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };

    res.json({
      message: "Sign in successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Sign in error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 2); // OTP expires in 2 minutes

    // Update user with new OTP
    user.otp = {
      code: newOtp,
      expiresAt: otpExpiresAt,
    };
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, newOtp);
    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later.",
        error: "Email service error",
      });
    }

    res.json({
      message: "Password reset OTP sent successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = verifyOTPSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({
        message: "No OTP found for this user",
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Generate reset password token
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Clear OTP
    user.otp = undefined;
    await user.save();

    res.json({
      message: "OTP verified successfully",
      token: resetToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Verify OTP error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = resetPasswordSchema.parse(req.body);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password reset successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - Token not provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add token to blacklist with expiration time
      await Token.create({
        token,
        expiresAt: new Date(decoded.exp * 1000), // Convert JWT exp to Date
      });

      return res.status(200).json({
        message: "Logged out successfully",
      });
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendEmail,
  signIn,
  forgotPassword,
  verifyOTP,
  resetPassword,
  logout,
};
