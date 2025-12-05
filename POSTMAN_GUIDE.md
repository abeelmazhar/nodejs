# Postman API Testing Guide

## Prerequisites

1. Make sure your server is running:
   ```bash
   npm start
   # or for development
   npm run dev
   ```
2. Your server runs on: `http://localhost:5000` (or the PORT specified in your .env file)

## Available API Endpoints

### Base URL: `http://localhost:5000/api`

---

## 1. Signup (Create User)

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/signup`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Expected Response (201):**
  ```json
  {
    "message": "User registered",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

---

## 2. Login

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Expected Response (200):**
  ```json
  {
    "message": "Login successful",
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **Note:** Save the `accessToken` for authenticated requests (if you add authentication middleware later)

---

## 3. Get All Users

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/users`
- **Headers:** None required (unless you add authentication)
- **Expected Response (200):**
  ```json
  [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
  ```

---

## 4. Update User

- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/users/:id`
  - Replace `:id` with the actual user ID (e.g., `http://localhost:5000/api/users/507f1f77bcf86cd799439011`)
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
  ```

---

## 5. Delete User

- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/users/:id`
  - Replace `:id` with the actual user ID (e.g., `http://localhost:5000/api/users/507f1f77bcf86cd799439011`)
- **Headers:** None required (unless you add authentication)

---

## Step-by-Step Instructions for Postman

### First Time Setup:

1. **Open Postman** (download from [postman.com](https://www.postman.com/downloads/) if you don't have it)
2. **Start your server** in terminal:
   ```bash
   npm start
   ```
3. **Create a new Collection** (optional but recommended):
   - Click "New" → "Collection"
   - Name it "Node.js API"

### Testing Each Endpoint:

#### For POST requests (Signup/Login):

1. Click "New" → "HTTP Request"
2. Select **POST** from the dropdown
3. Enter the URL (e.g., `http://localhost:5000/api/signup`)
4. Go to **Headers** tab:
   - Add key: `Content-Type`, value: `application/json`
5. Go to **Body** tab:
   - Select **raw**
   - Select **JSON** from the dropdown
   - Paste the JSON body
6. Click **Send**

#### For GET requests:

1. Click "New" → "HTTP Request"
2. Select **GET** from the dropdown
3. Enter the URL (e.g., `http://localhost:5000/api/users`)
4. Click **Send**

#### For PUT/DELETE requests:

1. Click "New" → "HTTP Request"
2. Select **PUT** or **DELETE** from the dropdown
3. Enter the URL with the user ID (e.g., `http://localhost:5000/api/users/507f1f77bcf86cd799439011`)
4. For PUT: Add headers and body like POST requests
5. Click **Send**

---

## Quick Test Flow:

1. **Signup** → Create a new user
2. **Login** → Get access token (save it if needed)
3. **Get All Users** → See all registered users
4. **Update User** → Modify user details (use ID from step 3)
5. **Delete User** → Remove a user (use ID from step 3)

---

## Troubleshooting:

- **Connection Error:** Make sure your server is running (`npm start`)
- **404 Not Found:** Check the URL path matches exactly (case-sensitive)
- **400 Bad Request:** Check your JSON body format is correct
- **500 Server Error:** Check your MongoDB connection in `config/db.js`
