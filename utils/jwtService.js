/**
 * JWT Service
 * Handles JWT token generation, verification, and refresh token management
 */

const jwt = require("jsonwebtoken");

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

/**
 * Generate Access Token
 * Short-lived token for API access
 */
const generateAccessToken = (userId, email) => {
  if (!process.env.ACCESS_SECRET) {
    throw new Error("ACCESS_SECRET environment variable is not set");
  }

  return jwt.sign(
    {
      userId: userId.toString(),
      email: email,
      type: "access",
    },
    process.env.ACCESS_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

/**
 * Generate Refresh Token
 * Long-lived token for getting new access tokens
 */
const generateRefreshToken = (userId, email) => {
  if (!process.env.REFRESH_SECRET) {
    throw new Error("REFRESH_SECRET environment variable is not set");
  }

  return jwt.sign(
    {
      userId: userId.toString(),
      email: email,
      type: "refresh",
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );
};

/**
 * Generate both access and refresh tokens
 */
const generateTokens = (userId, email) => {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, email);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    if (!process.env.ACCESS_SECRET) {
      throw new Error("ACCESS_SECRET environment variable is not set");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

    // Ensure it's an access token
    if (decoded.type !== "access") {
      return null;
    }

    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    if (!process.env.REFRESH_SECRET) {
      throw new Error("REFRESH_SECRET environment variable is not set");
    }

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    // Ensure it's a refresh token
    if (decoded.type !== "refresh") {
      return null;
    }

    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
};

/**
 * Decode token without verification (for debugging)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
