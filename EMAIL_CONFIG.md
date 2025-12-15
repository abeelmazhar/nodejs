# Email Configuration Guide

## OTP Login Feature Setup

This application now includes OTP (One-Time Password) based login. When a user logs in, they receive an OTP via email and must verify it to complete the login process.

## Required Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Email Service Setup

### For Gmail:

1. **Enable 2-Step Verification:**
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Generate a new app password for "Mail"
   - Use this app password as `EMAIL_PASSWORD` (not your regular Gmail password)

### For Other Email Services:

You can use other email services by changing `EMAIL_SERVICE`:

- **Outlook/Hotmail:** `EMAIL_SERVICE=hotmail`
- **Yahoo:** `EMAIL_SERVICE=yahoo`
- **Custom SMTP:** Configure manually in `utils/emailService.js`

For custom SMTP, you'll need to modify the transporter configuration:

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## API Endpoints

### 1. Login (Send OTP)
- **Method:** `POST`
- **URL:** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "userpassword"
  }
  ```
- **Response:** OTP sent to email

### 2. Verify OTP
- **Method:** `POST`
- **URL:** `/auth/verify-otp`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response:** User data on successful verification

## OTP Details

- **OTP Length:** 6 digits
- **OTP Expiration:** 5 minutes
- **OTP Format:** Numeric only (e.g., 123456)

## Testing

To test the email configuration, you can check the server logs when sending an OTP. If email sending fails, you'll see an error message in the response.

## Troubleshooting

1. **Email not sending:**
   - Check your `.env` file has correct credentials
   - For Gmail, ensure you're using an App Password, not your regular password
   - Check your email service allows SMTP access

2. **OTP expired:**
   - OTPs expire after 5 minutes
   - Request a new login to get a new OTP

3. **Invalid OTP:**
   - Ensure you're entering the exact 6-digit code
   - Check that you're using the OTP for the correct email address

