# How to Test Pagination API

## Quick Testing Guide

Follow these steps to test the pagination feature on your Events API.

---

## Prerequisites

1. **Start your server:**
   ```bash
   npm start
   # or
   npm run dev
   ```

2. **Server should be running on:** `http://localhost:5000`

---

## Testing Methods

### Method 1: Using Postman (Recommended)

#### Test 1: Default Pagination

1. Open Postman
2. Create a new request:
   - **Method:** `GET`
   - **URL:** `http://localhost:5000/events`
3. Click **Send**

**Expected Result:**
- Returns first 10 events (page 1, limit 10)
- Response includes pagination metadata

---

#### Test 2: Custom Page and Limit

1. **Method:** `GET`
2. **URL:** `http://localhost:5000/events?page=2&limit=5`
3. Click **Send**

**Expected Result:**
- Returns events 6-10 (page 2, 5 items per page)
- `currentPage: 2`
- `itemsPerPage: 5`

---

#### Test 3: First Page with 3 Items

1. **Method:** `GET`
2. **URL:** `http://localhost:5000/events?page=1&limit=3`
3. Click **Send**

**Expected Result:**
- Returns first 3 events
- `currentPage: 1`
- `itemsPerPage: 3`
- `hasNextPage: true` (if more than 3 events exist)

---

#### Test 4: Invalid Page Number

1. **Method:** `GET`
2. **URL:** `http://localhost:5000/events?page=0`
3. Click **Send**

**Expected Result:**
- Status: `400 Bad Request`
- Error message: "Page number must be greater than 0"

---

#### Test 5: Page Exceeds Total

1. **Method:** `GET`
2. **URL:** `http://localhost:5000/events?page=999`
3. Click **Send**

**Expected Result:**
- Status: `400 Bad Request`
- Error message: "Page 999 does not exist. Total pages: X"
- Includes pagination metadata

---

#### Test 6: Large Limit (Should Cap at 100)

1. **Method:** `GET`
2. **URL:** `http://localhost:5000/events?page=1&limit=200`
3. Click **Send**

**Expected Result:**
- Returns maximum 100 items
- `itemsPerPage: 100` (not 200)

---

### Method 2: Using Browser

Simply open these URLs in your browser:

```
http://localhost:5000/events
http://localhost:5000/events?page=2
http://localhost:5000/events?page=1&limit=5
```

**Note:** Browser will show raw JSON. For better formatting, use Postman or a JSON formatter extension.

---

### Method 3: Using cURL (Command Line)

#### Test 1: Default Pagination

```bash
curl http://localhost:5000/events
```

#### Test 2: Custom Pagination

```bash
curl "http://localhost:5000/events?page=2&limit=5"
```

#### Test 3: Pretty Print (with jq - if installed)

```bash
curl http://localhost:5000/events | jq
```

---

### Method 4: Using JavaScript (Node.js)

Create a test file `test-pagination.js`:

```javascript
const fetch = require('node-fetch'); // or use built-in fetch in Node 18+

async function testPagination() {
  const baseUrl = 'http://localhost:5000/events';
  
  console.log('=== Test 1: Default Pagination ===');
  const response1 = await fetch(baseUrl);
  const data1 = await response1.json();
  console.log('Current Page:', data1.data.pagination.currentPage);
  console.log('Total Pages:', data1.data.pagination.totalPages);
  console.log('Items Per Page:', data1.data.pagination.itemsPerPage);
  console.log('Total Items:', data1.data.pagination.totalItems);
  console.log('Has Next Page:', data1.data.pagination.hasNextPage);
  console.log('Events Count:', data1.data.events.length);
  console.log('');
  
  console.log('=== Test 2: Page 2, Limit 5 ===');
  const response2 = await fetch(`${baseUrl}?page=2&limit=5`);
  const data2 = await response2.json();
  console.log('Current Page:', data2.data.pagination.currentPage);
  console.log('Items Per Page:', data2.data.pagination.itemsPerPage);
  console.log('Events Count:', data2.data.events.length);
  console.log('');
  
  console.log('=== Test 3: Invalid Page ===');
  const response3 = await fetch(`${baseUrl}?page=0`);
  const data3 = await response3.json();
  console.log('Status:', response3.status);
  console.log('Error:', data3.error);
}

testPagination().catch(console.error);
```

Run it:
```bash
node test-pagination.js
```

---

## Step-by-Step Postman Testing

### Complete Test Flow:

1. **Test Default Behavior**
   ```
   GET http://localhost:5000/events
   ```
   - Should return page 1 with 10 items
   - Check `pagination.currentPage = 1`
   - Check `pagination.itemsPerPage = 10`

2. **Test Page Navigation**
   ```
   GET http://localhost:5000/events?page=1&limit=5
   GET http://localhost:5000/events?page=2&limit=5
   GET http://localhost:5000/events?page=3&limit=5
   ```
   - Verify different events on each page
   - Check `hasNextPage` and `hasPreviousPage` flags

3. **Test Edge Cases**
   ```
   GET http://localhost:5000/events?page=0        # Should error
   GET http://localhost:5000/events?page=-1       # Should error
   GET http://localhost:5000/events?limit=0       # Should use default
   GET http://localhost:5000/events?limit=200     # Should cap at 100
   ```

4. **Test Large Dataset**
   - If you have many events, test:
   ```
   GET http://localhost:5000/events?page=1&limit=10
   GET http://localhost:5000/events?page=1&limit=50
   GET http://localhost:5000/events?page=1&limit=100
   ```

---

## Expected Response Structure

### Success Response:

```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "eventId": 1,
        "title": "Event Title",
        "description": "Event Description",
        "eventDate": "2024-12-31T00:00:00.000Z",
        "location": "Location",
        "image": "http://localhost:5000/uploads/image.jpg",
        "timeSlots": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Error Response (Invalid Page):

```json
{
  "success": false,
  "message": "Invalid page number",
  "error": "Page 999 does not exist. Total pages: 5",
  "pagination": {
    "currentPage": 999,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

---

## Quick Test Checklist

- [ ] Default request returns page 1 with 10 items
- [ ] Custom page parameter works
- [ ] Custom limit parameter works
- [ ] Maximum limit caps at 100
- [ ] Invalid page (0 or negative) returns error
- [ ] Page exceeding total returns error
- [ ] Pagination metadata is correct
- [ ] `hasNextPage` is true when more pages exist
- [ ] `hasPreviousPage` is false on first page
- [ ] Events are sorted by newest first

---

## Troubleshooting

### Issue: "Cannot GET /events"

**Solution:** Make sure your server is running on port 5000

### Issue: Empty events array

**Solution:** You might not have events in your database. Create some events first using `POST /create-event/`

### Issue: Pagination shows wrong total

**Solution:** Check if events exist in database. Total count is calculated from actual database records.

---

## Visual Testing with Postman

1. **Create a Collection:**
   - Name it "Events Pagination Tests"
   - Add multiple requests for different test cases

2. **Use Variables:**
   - Set base URL as variable: `{{baseUrl}}/events`
   - Easy to switch between environments

3. **Save Responses:**
   - Save example responses for documentation
   - Compare responses across different pages

---

## Advanced Testing

### Test Pagination Logic:

```javascript
// Test that pagination math is correct
const page = 2;
const limit = 10;
const totalItems = 50;

// Expected values
const expectedSkip = (page - 1) * limit; // 10
const expectedTotalPages = Math.ceil(totalItems / limit); // 5
const expectedHasNext = page < expectedTotalPages; // true
```

---

## Quick Commands Reference

```bash
# Default (page 1, limit 10)
curl http://localhost:5000/events

# Page 2, 10 items
curl "http://localhost:5000/events?page=2"

# Page 1, 5 items
curl "http://localhost:5000/events?page=1&limit=5"

# Page 2, 20 items
curl "http://localhost:5000/events?page=2&limit=20"

# Test error (invalid page)
curl "http://localhost:5000/events?page=0"
```

---

## Next Steps After Testing

Once pagination works:
1. ✅ Test with different page sizes
2. ✅ Verify metadata accuracy
3. ✅ Test edge cases
4. ✅ Integrate with frontend
5. ✅ Add pagination UI controls

Happy Testing! 🚀

