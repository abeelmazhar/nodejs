/**
 * Email Service
 * Handles sending emails using nodemailer
 */

const nodemailer = require("nodemailer");

/**
 * Create email transporter
 * Uses environment variables for email configuration
 */
const createTransporter = () => {
  // Validate environment variables
  if (!process.env.EMAIL_USER) {
    throw new Error(
      "EMAIL_USER environment variable is not set. Please add it to your .env file."
    );
  }

  if (!process.env.EMAIL_PASSWORD) {
    throw new Error(
      "EMAIL_PASSWORD environment variable is not set. Please add it to your .env file."
    );
  }

  // For Gmail, you need to use an App Password
  // For other services, adjust the configuration accordingly
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or App Password
    },
  });
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 * @param {string} userName - User's name (optional)
 * @returns {Promise<object>} Email sending result
 */
const sendOTPEmail = async (email, otp, userName = "User") => {
  try {
    // Validate email address
    if (!email || !email.includes("@")) {
      throw new Error("Invalid recipient email address");
    }

    const transporter = createTransporter();

    // Verify transporter connection before sending
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login OTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Login Verification Code</h2>
            <p>Hello ${userName},</p>
            <p>You have requested to login to your account. Please use the following OTP code to complete your login:</p>
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 30 seconds.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName},
        
        You have requested to login to your account. Please use the following OTP code to complete your login:
        
        ${otp}
        
        This code will expire in 30 seconds.
        
        If you didn't request this code, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to send email";

    if (
      error.message.includes("EMAIL_USER") ||
      error.message.includes("EMAIL_PASSWORD")
    ) {
      errorMessage = error.message;
    } else if (error.code === "EAUTH") {
      errorMessage =
        "Email authentication failed. Please check your EMAIL_USER and EMAIL_PASSWORD in .env file. For Gmail, use an App Password, not your regular password.";
    } else if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
      errorMessage =
        "Could not connect to email server. Please check your internet connection and email service settings.";
    } else if (error.message) {
      errorMessage = `Failed to send email: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} True if email configuration is valid
 */
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  testEmailConfig,
};
