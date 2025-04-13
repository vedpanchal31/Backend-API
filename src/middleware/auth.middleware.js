const jwt = require("jsonwebtoken");
const Token = require("../models/token.model");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized - Bearer token not provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is blacklisted
    const blacklistedToken = await Token.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        message: "Unauthorized - Token has been revoked",
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
