/**
 * Token Blacklist Service
 * Stores blacklisted tokens (for logout functionality)
 * In production, use Redis or database instead of in-memory storage
 */

// In-memory storage for blacklisted tokens
// Format: Set of token strings
const blacklistedTokens = new Set();

/**
 * Add token to blacklist
 */
const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};

/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

/**
 * Remove expired tokens from blacklist (cleanup)
 * Note: In production with Redis, set TTL instead
 */
const cleanupBlacklist = () => {
  // For in-memory storage, we could implement TTL logic
  // For now, tokens remain until server restart
  // In production, use Redis with automatic expiration
};

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklist,
};
