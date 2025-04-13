require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Authentication API",
    documentation: "/api-docs",
  });
});

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
    availableRoutes: {
      root: "/",
      documentation: "/api-docs",
      register: "/api/auth/register",
      verifyEmail: "/api/auth/verify-email",
      resendEmail: "/api/auth/resend-email",
      signIn: "/api/auth/sign-in",
      forgotPassword: "/api/auth/forgot-password",
      verifyOTP: "/api/auth/verify-otp",
      resetPassword: "/api/auth/reset-password/:token",
    },
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
