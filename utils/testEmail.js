/**
 * Test Email Configuration
 * Run this script to test if your email configuration is correct
 * Usage: node utils/testEmail.js
 */

require("dotenv").config();
const emailService = require("./emailService");

async function testEmailConfig() {
  console.log("Testing email configuration...\n");

  // Check environment variables
  console.log("Environment Variables:");
  console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "gmail (default)");
  console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✓ Set" : "✗ Missing");
  console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✓ Set" : "✗ Missing");
  console.log("");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("❌ Error: EMAIL_USER and EMAIL_PASSWORD must be set in your .env file");
    console.log("\nPlease add the following to your .env file:");
    console.log("EMAIL_SERVICE=gmail");
    console.log("EMAIL_USER=your-email@gmail.com");
    console.log("EMAIL_PASSWORD=your-app-password");
    process.exit(1);
  }

  // Test email connection
  try {
    console.log("Testing email connection...");
    const isValid = await emailService.testEmailConfig();
    
    if (isValid) {
      console.log("✅ Email configuration is valid!");
      console.log("\nYou can now use the OTP login feature.");
    } else {
      console.error("❌ Email configuration test failed");
      console.log("\nCommon issues:");
      console.log("1. For Gmail: Make sure you're using an App Password, not your regular password");
      console.log("2. Enable 2-Step Verification in your Google Account");
      console.log("3. Check that EMAIL_USER and EMAIL_PASSWORD are correct");
    }
  } catch (error) {
    console.error("❌ Error testing email configuration:", error.message);
    console.log("\nTroubleshooting:");
    if (error.message.includes("EAUTH")) {
      console.log("- Authentication failed: Check your EMAIL_USER and EMAIL_PASSWORD");
      console.log("- For Gmail: Use an App Password (not your regular password)");
    } else if (error.message.includes("ECONNECTION")) {
      console.log("- Connection failed: Check your internet connection");
    } else {
      console.log("- Error:", error.message);
    }
  }
}

// Run the test
testEmailConfig();

