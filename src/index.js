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
    documentation: "/docs",
  });
});

// Swagger documentation
app.use("/docs", swaggerUi.serve);
app.get(
  "/docs",
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Authentication API Documentation",
  })
);

// Routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/users", require("./routes/user.routes"));

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
    availableRoutes: {
      root: "/",
      documentation: "/docs",
      register: "/auth/register",
      verifyEmail: "/auth/verify-email",
      resendEmail: "/auth/resend-email",
      signIn: "/auth/sign-in",
      forgotPassword: "/auth/forgot-password",
      verifyOTP: "/auth/verify-otp",
      resetPassword: "/auth/reset-password/:token",
      getProfile: "/users/profile",
      updateProfile: "/users/profile",
      deleteAccount: "/users/profile",
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
  console.log(`API Documentation: http://localhost:${PORT}/docs`);
});
