/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 */

// In-memory storage for OTPs
// Format: { email: { otp: '123456', expiresAt: Date, userId: 'user_id' } }
const otpStore = new Map();

// OTP expiration time (30 seconds)
const OTP_EXPIRATION_TIME = 30 * 1000; // 30 seconds in milliseconds

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP for a user
 */
const storeOTP = (email, userId) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);

  otpStore.set(email.toLowerCase().trim(), {
    otp,
    expiresAt,
    userId,
  });

  // Clean up expired OTPs periodically
  cleanupExpiredOTPs();

  return otp;
};

/**
 * Verify OTP for a user
 */
const verifyOTP = (email, otp) => {
  const emailKey = email.toLowerCase().trim();
  const storedData = otpStore.get(emailKey);

  if (!storedData) {
    return null; // No OTP found for this email
  }

  // Check if OTP has expired
  if (new Date() > storedData.expiresAt) {
    otpStore.delete(emailKey); // Remove expired OTP
    return null; // OTP expired
  }

  // Check if OTP matches
  if (storedData.otp !== otp) {
    return null; // OTP doesn't match
  }

  // OTP is valid, get userId and remove OTP from store
  const userId = storedData.userId;
  otpStore.delete(emailKey); // Remove OTP after successful verification

  return { userId };
};

/**
 * Remove expired OTPs from storage
 */
const cleanupExpiredOTPs = () => {
  const now = new Date();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
};

/**
 * Get OTP for a user (for testing/debugging purposes)
 */
const getOTP = (email) => {
  return otpStore.get(email.toLowerCase().trim()) || null;
};

/**
 * Delete OTP for a user
 */
const deleteOTP = (email) => {
  otpStore.delete(email.toLowerCase().trim());
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  getOTP,
  deleteOTP,
  cleanupExpiredOTPs,
};
