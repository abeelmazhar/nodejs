# Password Reset API Documentation

## Overview

This API allows users to reset their forgotten passwords through a secure token-based system. The process involves two steps:
1. **Request Password Reset** - User requests a reset token via email
2. **Reset Password** - User uses the token to set a new password

---

## Base URL

```
http://localhost:5000/auth
```

---

## API Endpoints

### 1. Forgot Password (Request Reset Token)

**Endpoint:** `POST /auth/forgot-password`

**Description:** Sends a password reset token to the user's email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Headers:**
```
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "data": {
    "email": "user@example.com"
  }
}
```

**Note:** For security reasons, the API always returns success even if the email doesn't exist. This prevents email enumeration attacks.

**Development Mode Response:**
In development mode, the response also includes the token (for testing):
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "data": {
    "email": "user@example.com",
    "token": "abc123def456...",
    "note": "Token only shown in development mode"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing or invalid email:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required"
  }
}
```

- **500 Internal Server Error** - Email sending failed:
```json
{
  "success": false,
  "message": "Failed to send password reset email",
  "error": "Please check your email configuration or try again later."
}
```

---

### 2. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Resets the user's password using the token received via email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "abc123def456...",
  "newPassword": "newSecurePassword123"
}
```

**Headers:**
```
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "email": "user@example.com",
    "message": "Your password has been reset successfully. You can now login with your new password."
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing or invalid fields:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "token": "Reset token is required",
    "newPassword": "New password is required"
  }
}
```

- **401 Unauthorized** - Invalid or expired token:
```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "error": "The reset token is invalid or has expired. Please request a new password reset."
}
```

- **404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found",
  "error": "User account no longer exists."
}
```

---

## Complete Flow Example

### Step 1: Request Password Reset

**Using cURL:**
```bash
curl -X POST http://localhost:5000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Using Postman:**
1. Method: `POST`
2. URL: `http://localhost:5000/auth/forgot-password`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "email": "user@example.com"
   }
   ```

**Result:** User receives an email with a reset token (valid for 15 minutes)

---

### Step 2: Reset Password

**Using cURL:**
```bash
curl -X POST http://localhost:5000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "abc123def456...",
    "newPassword": "newSecurePassword123"
  }'
```

**Using Postman:**
1. Method: `POST`
2. URL: `http://localhost:5000/auth/reset-password`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "email": "user@example.com",
     "token": "abc123def456...",
     "newPassword": "newSecurePassword123"
   }
   ```

**Result:** Password is reset, user can now login with new password

---

## JavaScript/Fetch Examples

### Request Password Reset

```javascript
async function requestPasswordReset(email) {
  try {
    const response = await fetch('http://localhost:5000/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Password reset email sent!');
      // In development, you might see the token in data.data.token
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage
requestPasswordReset('user@example.com');
```

### Reset Password

```javascript
async function resetPassword(email, token, newPassword) {
  try {
    const response = await fetch('http://localhost:5000/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
        newPassword,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Password reset successfully!');
      // Redirect to login page
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage
resetPassword('user@example.com', 'abc123def456...', 'newSecurePassword123');
```

---

## Security Features

1. **Token Expiration:** Reset tokens expire after 15 minutes
2. **One-Time Use:** Tokens are deleted after successful password reset
3. **Secure Hashing:** Tokens are hashed before storage
4. **Email Enumeration Protection:** API doesn't reveal if email exists
5. **Password Hashing:** New passwords are hashed using bcrypt

---

## Important Notes

1. **Token Expiration:** Reset tokens are valid for **15 minutes** only
2. **One-Time Use:** Each token can only be used once
3. **Email Required:** The email must match the one used during signup
4. **Password Requirements:** New password must be at least 4 characters
5. **Development Mode:** In development, the token is included in the response for testing

---

## Testing the API

### Quick Test Flow:

1. **Signup a user** (if not already done):
   ```bash
   POST /auth/signup
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "oldpassword123"
   }
   ```

2. **Request password reset**:
   ```bash
   POST /auth/forgot-password
   {
     "email": "test@example.com"
   }
   ```

3. **Check email** for the reset token, or in development mode, get it from the API response

4. **Reset password**:
   ```bash
   POST /auth/reset-password
   {
     "email": "test@example.com",
     "token": "token_from_email_or_response",
     "newPassword": "newpassword123"
   }
   ```

5. **Try logging in** with the new password:
   ```bash
   POST /auth/login
   {
     "email": "test@example.com",
     "password": "newpassword123"
   }
   ```

---

## Troubleshooting

### Token Expired
- **Error:** "Invalid or expired reset token"
- **Solution:** Request a new password reset

### Email Not Received
- Check spam folder
- Verify email configuration in `.env` file
- Check server logs for email errors
- In development mode, check API response for token

### Invalid Token
- Make sure you're using the complete token from email
- Token is case-sensitive
- Ensure email matches exactly

---

## Environment Variables

Make sure these are set in your `.env` file:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000  # Optional: for reset link in email
```

---

## Next Steps

After resetting password, users should:
1. Login with new password using `/auth/login`
2. Complete OTP verification using `/auth/verify-otp`
3. Access their account


