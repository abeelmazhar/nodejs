/**
 * Password Reset Service
 * Handles password reset token generation, storage, and verification
 */

const crypto = require("crypto");

// In-memory storage for password reset tokens
// Format: { email: { token: 'hashed_token', expiresAt: Date, userId: 'user_id' } }
const resetTokenStore = new Map();

// Token expiration time (15 minutes)
const TOKEN_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Generate a secure random token
 * @returns {string} Random token string
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash a token for secure storage
 * @param {string} token - Plain token
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Store reset token for a user
 * @param {string} email - User's email
 * @param {string} userId - User's ID
 * @returns {string} Plain token (to send via email)
 */
const storeResetToken = (email, userId) => {
  const plainToken = generateResetToken();
  const hashedToken = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME);

  resetTokenStore.set(email.toLowerCase().trim(), {
    token: hashedToken,
    expiresAt,
    userId,
  });

  // Clean up expired tokens periodically
  cleanupExpiredTokens();

  return plainToken; // Return plain token to send via email
};

/**
 * Verify reset token for a user
 * @param {string} email - User's email
 * @param {string} token - Token to verify
 * @returns {object|null} Returns { userId } if valid, null if invalid
 */
const verifyResetToken = (email, token) => {
  const emailKey = email.toLowerCase().trim();
  const storedData = resetTokenStore.get(emailKey);

  if (!storedData) {
    return null; // No token found for this email
  }

  // Check if token has expired
  if (new Date() > storedData.expiresAt) {
    resetTokenStore.delete(emailKey); // Remove expired token
    return null; // Token expired
  }

  // Hash the provided token and compare with stored hash
  const hashedToken = hashToken(token);
  if (storedData.token !== hashedToken) {
    return null; // Token doesn't match
  }

  // Token is valid, get userId and remove token from store
  const userId = storedData.userId;
  resetTokenStore.delete(emailKey); // Remove token after successful verification

  return { userId };
};

/**
 * Remove expired tokens from storage
 */
const cleanupExpiredTokens = () => {
  const now = new Date();
  for (const [email, data] of resetTokenStore.entries()) {
    if (now > data.expiresAt) {
      resetTokenStore.delete(email);
    }
  }
};

/**
 * Get reset token for a user (for testing/debugging purposes)
 * @param {string} email - User's email
 * @returns {object|null} Token data or null
 */
const getResetToken = (email) => {
  return resetTokenStore.get(email.toLowerCase().trim()) || null;
};

/**
 * Delete reset token for a user
 * @param {string} email - User's email
 */
const deleteResetToken = (email) => {
  resetTokenStore.delete(email.toLowerCase().trim());
};

module.exports = {
  generateResetToken,
  hashToken,
  storeResetToken,
  verifyResetToken,
  getResetToken,
  deleteResetToken,
  cleanupExpiredTokens,
};


