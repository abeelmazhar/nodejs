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
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Login Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header with gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                        🔐 Login Verification
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Hello <strong style="color: #667eea;">${userName}</strong>,
                      </p>
                      <p style="margin: 0 0 30px 0; color: #718096; font-size: 15px; line-height: 1.6;">
                        You have requested to login to your account. Please use the verification code below to complete your login process.
                      </p>
                      
                      <!-- OTP Code Box -->
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
                        <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">
                          Your Verification Code
                        </p>
                        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 15px auto; display: inline-block; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">
                          <h2 style="margin: 0; color: #667eea; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${otp}
                          </h2>
                        </div>
                      </div>
                      
                      <!-- Warning Box -->
                      <div style="background-color: #fff5e6; border-left: 4px solid #ffa726; border-radius: 6px; padding: 15px 20px; margin: 25px 0;">
                        <p style="margin: 0; color: #e65100; font-size: 14px; line-height: 1.5;">
                          <strong>⏰ Important:</strong> This code will expire in <strong>30 seconds</strong>. Please use it immediately.
                        </p>
                      </div>
                      
                      <p style="margin: 25px 0 0 0; color: #a0aec0; font-size: 13px; line-height: 1.5;">
                        If you didn't request this code, please ignore this email or contact support if you have concerns about your account security.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #718096; font-size: 12px; line-height: 1.5;">
                        This is an automated message. Please do not reply to this email.
                      </p>
                      <p style="margin: 10px 0 0 0; color: #cbd5e0; font-size: 11px;">
                        © ${new Date().getFullYear()} All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
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
