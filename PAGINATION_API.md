# Pagination API Documentation

## Overview

The Events API now supports **pagination** to efficiently handle large datasets. Instead of returning all events at once, you can request specific pages with a configurable number of items per page.

---

## Why Pagination?

- **Performance:** Faster responses by limiting data transfer
- **User Experience:** Easier navigation through large datasets
- **Scalability:** Works efficiently even with thousands of events
- **Industry Standard:** Used by major APIs (GitHub, Twitter, etc.)

---

## API Endpoint

### Get All Events (Paginated)

**Endpoint:** `GET /events`

**Query Parameters:**

| Parameter | Type | Default | Min | Max | Description |
|-----------|------|---------|-----|-----|-------------|
| `page` | number | 1 | 1 | - | Page number to retrieve |
| `limit` | number | 10 | 1 | 100 | Number of items per page |

---

## Request Examples

### Basic Request (Default Pagination)

```bash
GET http://localhost:5000/events
```

**Response:** Returns first 10 events (page 1, limit 10)

---

### Custom Page and Limit

```bash
GET http://localhost:5000/events?page=2&limit=20
```

**Response:** Returns events 21-40 (page 2, 20 items per page)

---

### First Page with 5 Items

```bash
GET http://localhost:5000/events?page=1&limit=5
```

**Response:** Returns first 5 events

---

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "eventId": 1,
        "title": "Tech Conference 2024",
        "description": "Annual technology conference",
        "eventDate": "2024-12-31T00:00:00.000Z",
        "location": "New York",
        "image": "http://localhost:5000/uploads/image.jpg",
        "timeSlots": [
          {
            "id_event_date": 1,
            "start": "09:00",
            "end": "10:00"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
      // ... more events
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

---

## Pagination Metadata Explained

| Field | Description | Example |
|-------|-------------|---------|
| `currentPage` | Current page number | `1` |
| `totalPages` | Total number of pages | `5` |
| `totalItems` | Total number of events in database | `50` |
| `itemsPerPage` | Number of items in current page | `10` |
| `hasNextPage` | Whether there's a next page | `true` |
| `hasPreviousPage` | Whether there's a previous page | `false` |

---

## Error Responses

### Invalid Page Number (< 1)

```bash
GET http://localhost:5000/events?page=0
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Page number must be greater than 0"
}
```

---

### Page Number Exceeds Total Pages

```bash
GET http://localhost:5000/events?page=100
```

**Response (400):**
```json
{
  "success": false,
  "message": "Invalid page number",
  "error": "Page 100 does not exist. Total pages: 5",
  "pagination": {
    "currentPage": 100,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

---

## Usage Examples

### Example 1: Get First Page

```bash
GET http://localhost:5000/events?page=1&limit=10
```

**Use Case:** Initial page load, showing first 10 events

---

### Example 2: Get Second Page

```bash
GET http://localhost:5000/events?page=2&limit=10
```

**Use Case:** "Load More" or "Next Page" button

---

### Example 3: Large Page Size

```bash
GET http://localhost:5000/events?page=1&limit=50
```

**Use Case:** Desktop view with more items per page

---

### Example 4: Small Page Size

```bash
GET http://localhost:5000/events?page=1&limit=5
```

**Use Case:** Mobile view with fewer items

---

## JavaScript/Fetch Examples

### Basic Pagination

```javascript
async function getEvents(page = 1, limit = 10) {
  const response = await fetch(
    `http://localhost:5000/events?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  
  if (data.success) {
    console.log('Events:', data.data.events);
    console.log('Pagination:', data.data.pagination);
    
    // Check if there's a next page
    if (data.data.pagination.hasNextPage) {
      console.log('More events available!');
    }
  }
}

// Usage
getEvents(1, 10); // Get first page
getEvents(2, 10); // Get second page
```

---

### Pagination with Navigation

```javascript
let currentPage = 1;
const itemsPerPage = 10;

async function loadEvents(page) {
  const response = await fetch(
    `http://localhost:5000/events?page=${page}&limit=${itemsPerPage}`
  );
  const data = await response.json();
  
  if (data.success) {
    const { events, pagination } = data.data;
    
    // Display events
    displayEvents(events);
    
    // Update pagination controls
    updatePaginationControls(pagination);
  }
}

function updatePaginationControls(pagination) {
  // Enable/disable previous button
  document.getElementById('prevBtn').disabled = !pagination.hasPreviousPage;
  
  // Enable/disable next button
  document.getElementById('nextBtn').disabled = !pagination.hasNextPage;
  
  // Show page info
  document.getElementById('pageInfo').textContent = 
    `Page ${pagination.currentPage} of ${pagination.totalPages}`;
}

// Navigation functions
function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    loadEvents(currentPage);
  }
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    loadEvents(currentPage);
  }
}
```

---

## Best Practices

### 1. Default Values

Always provide defaults if parameters are missing:
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
```

### 2. Maximum Limit

Prevent abuse by setting a maximum limit:
```javascript
const maxLimit = 100;
const validLimit = Math.min(limit, maxLimit);
```

### 3. Input Validation

Validate page and limit values:
```javascript
if (page < 1) {
  return res.status(400).json({ error: "Page must be >= 1" });
}
```

### 4. Total Count

Always return total count for proper pagination UI:
```javascript
const totalItems = await Event.countDocuments();
const totalPages = Math.ceil(totalItems / limit);
```

### 5. Metadata

Include helpful metadata:
```javascript
{
  hasNextPage: page < totalPages,
  hasPreviousPage: page > 1
}
```

---

## Pagination Strategies

### Offset-Based (Current Implementation)

**Pros:**
- Simple to implement
- Easy to understand
- Works well for small to medium datasets

**Cons:**
- Performance degrades with large offsets
- Can skip items if data changes during pagination

**Use Case:** Your current implementation (good for learning and most use cases)

---

### Cursor-Based (Advanced)

**Pros:**
- Better performance for large datasets
- Consistent results even if data changes

**Cons:**
- More complex to implement
- Requires cursor management

**Use Case:** Very large datasets (millions of records)

---

## Testing with Postman

### Step 1: Basic Request

1. Method: `GET`
2. URL: `http://localhost:5000/events`
3. No query parameters needed (uses defaults)
4. Click **Send**

**Expected:** First 10 events

---

### Step 2: Custom Pagination

1. Method: `GET`
2. URL: `http://localhost:5000/events?page=2&limit=5`
3. Click **Send**

**Expected:** Events 6-10 (page 2, 5 items)

---

### Step 3: Test Edge Cases

1. **Invalid page:** `?page=0` → Should return 400 error
2. **Large page:** `?page=999` → Should return 400 error
3. **Large limit:** `?limit=200` → Should cap at 100

---

## Frontend Integration Example

### React Component Example

```jsx
import { useState, useEffect } from 'react';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents(currentPage);
  }, [currentPage]);

  async function loadEvents(page) {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/events?page=${page}&limit=10`
      );
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data.events);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {loading && <p>Loading...</p>}
      
      <div className="events-list">
        {events.map(event => (
          <div key={event.eventId}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
          </div>
        ))}
      </div>

      {pagination && (
        <div className="pagination">
          <button 
            disabled={!pagination.hasPreviousPage}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button 
            disabled={!pagination.hasNextPage}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Summary

✅ **Pagination implemented** with industry best practices  
✅ **Query parameters:** `page` and `limit`  
✅ **Default values:** page=1, limit=10  
✅ **Maximum limit:** 100 items per page  
✅ **Comprehensive metadata:** totalPages, hasNextPage, etc.  
✅ **Input validation:** Prevents invalid requests  
✅ **Error handling:** Clear error messages  

Your Events API is now production-ready with efficient pagination! 🚀

