# JWT Authentication API Documentation

## Overview

This API now uses **JWT (JSON Web Tokens)** for authentication. After successful OTP verification, users receive access and refresh tokens that must be included in protected API requests.

---

## How JWT Authentication Works

### 1. **Login Flow**
```
User Login → OTP Sent → Verify OTP → Receive Tokens
```

### 2. **Using Protected Routes**
```
Include Token in Header → Access Protected Routes
```

### 3. **Token Refresh**
```
Access Token Expires → Use Refresh Token → Get New Access Token
```

---

## Token Types

### Access Token
- **Purpose:** Short-lived token for API access
- **Expiration:** 15 minutes
- **Usage:** Include in `Authorization` header for protected routes
- **Format:** `Bearer <access_token>`

### Refresh Token
- **Purpose:** Long-lived token to get new access tokens
- **Expiration:** 7 days
- **Usage:** Send to `/auth/refresh-token` to get new access token
- **Storage:** Store securely (localStorage, secure cookie, etc.)

---

## API Endpoints

### 1. Verify OTP (Get Tokens)

**Endpoint:** `POST /auth/verify-otp`

**Description:** Verifies OTP and returns JWT tokens along with user data.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "phone": null,
      "city": null,
      "school": null,
      "class": null,
      "image": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Important:** Save both tokens! You'll need them for authenticated requests.

---

### 2. Refresh Access Token

**Endpoint:** `POST /auth/refresh-token`

**Description:** Generates a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "error": "The refresh token is invalid or has expired. Please login again."
}
```

---

### 3. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logs out user and blacklists tokens.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Headers (Optional):**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "message": "You have been logged out successfully."
  }
}
```

---

## Protected Routes

These routes require authentication. Include the access token in the `Authorization` header.

### Protected Endpoints:

1. **GET /my-account** - Get user account information
2. **PUT /my-account** - Update user account
3. **POST /create-event/** - Create a new event

---

## How to Use Protected Routes

### Step 1: Get Tokens

First, complete the login flow to get tokens:

```bash
# 1. Login (get OTP)
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# 2. Verify OTP (get tokens)
POST /auth/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Step 2: Use Access Token

Include the access token in the `Authorization` header:

**Using Postman:**
1. Go to **Headers** tab
2. Add header:
   - **Key:** `Authorization`
   - **Value:** `Bearer <your_access_token>`

**Using cURL:**
```bash
curl -X GET http://localhost:5000/my-account \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Using JavaScript (Fetch):**
```javascript
fetch('http://localhost:5000/my-account', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## Complete Example Flow

### 1. Login and Get Tokens

```bash
POST http://localhost:5000/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "abc123...",
      "refreshToken": "xyz789..."
    }
  }
}
```

### 2. Use Protected Route

```bash
GET http://localhost:5000/my-account
Authorization: Bearer abc123...
```

### 3. Access Token Expired? Refresh It

```bash
POST http://localhost:5000/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "xyz789..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_abc123..."
  }
}
```

### 4. Use New Access Token

```bash
GET http://localhost:5000/my-account
Authorization: Bearer new_abc123...
```

### 5. Logout

```bash
POST http://localhost:5000/auth/logout
Content-Type: application/json
Authorization: Bearer abc123...

{
  "refreshToken": "xyz789..."
}
```

---

## Error Responses

### 401 Unauthorized - No Token

```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No token provided. Please include a valid access token in the Authorization header."
}
```

**Solution:** Include `Authorization: Bearer <token>` header

---

### 401 Unauthorized - Invalid/Expired Token

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "The access token is invalid or has expired. Please login again or refresh your token."
}
```

**Solution:** 
1. Use `/auth/refresh-token` to get a new access token
2. Or login again with `/auth/verify-otp`

---

### 401 Unauthorized - Token Revoked

```json
{
  "success": false,
  "message": "Token has been revoked",
  "error": "This token has been logged out. Please login again."
}
```

**Solution:** Login again to get new tokens

---

## JavaScript Example (Complete Flow)

```javascript
// Store tokens (in real app, use secure storage)
let accessToken = null;
let refreshToken = null;

// 1. Login and get tokens
async function login(email, password) {
  // Step 1: Request OTP
  await fetch('http://localhost:5000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  // Step 2: Verify OTP (user enters OTP)
  const otp = prompt('Enter OTP from email:');
  const response = await fetch('http://localhost:5000/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });

  const data = await response.json();
  if (data.success) {
    accessToken = data.data.tokens.accessToken;
    refreshToken = data.data.tokens.refreshToken;
    console.log('Logged in!', data.data.user);
  }
}

// 2. Make authenticated request
async function getMyAccount() {
  const response = await fetch('http://localhost:5000/my-account', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.status === 401) {
    // Token expired, refresh it
    await refreshAccessToken();
    // Retry request
    return getMyAccount();
  }

  const data = await response.json();
  console.log('My account:', data);
}

// 3. Refresh access token
async function refreshAccessToken() {
  const response = await fetch('http://localhost:5000/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json();
  if (data.success) {
    accessToken = data.data.accessToken;
    console.log('Token refreshed!');
  } else {
    // Refresh token expired, need to login again
    console.log('Please login again');
  }
}

// 4. Logout
async function logout() {
  await fetch('http://localhost:5000/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ refreshToken })
  });

  accessToken = null;
  refreshToken = null;
  console.log('Logged out!');
}
```

---

## Security Best Practices

1. **Store Tokens Securely**
   - Don't store in localStorage (XSS risk)
   - Use httpOnly cookies in production
   - Or use secure storage mechanisms

2. **Token Expiration**
   - Access tokens expire in 15 minutes
   - Always refresh before expiration
   - Refresh tokens expire in 7 days

3. **HTTPS in Production**
   - Always use HTTPS to protect tokens in transit
   - Never send tokens over unencrypted connections

4. **Token Blacklisting**
   - Logout blacklists tokens
   - Stolen tokens become useless after logout

---

## Environment Variables

Make sure these are set in your `.env` file:

```env
ACCESS_SECRET=your-secret-key-for-access-tokens
REFRESH_SECRET=your-secret-key-for-refresh-tokens
```

**Important:** Use strong, random secrets in production!

---

## Testing with Postman

### Step 1: Get Tokens
1. `POST /auth/verify-otp` with email and OTP
2. Copy `accessToken` and `refreshToken` from response

### Step 2: Use Protected Route
1. Create new request: `GET /my-account`
2. Go to **Headers** tab
3. Add: `Authorization` = `Bearer <accessToken>`
4. Send request

### Step 3: Refresh Token (when access token expires)
1. `POST /auth/refresh-token`
2. Body: `{ "refreshToken": "<refreshToken>" }`
3. Get new `accessToken` from response

---

## What You've Learned

✅ **JWT Token Generation** - Creating secure tokens  
✅ **Authentication Middleware** - Protecting routes  
✅ **Token Verification** - Validating tokens  
✅ **Token Refresh** - Getting new access tokens  
✅ **Token Blacklisting** - Logout functionality  
✅ **Protected Routes** - Requiring authentication  

This is production-ready authentication! 🎉

