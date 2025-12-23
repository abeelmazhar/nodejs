# Search and Filter Events API Documentation

## Overview

This API allows you to search and filter events based on various criteria. It's a powerful feature that teaches you about:
- **Query Parameters**: How to accept and process multiple query parameters
- **MongoDB Filtering**: Using operators like `$regex`, `$gte`, `$lte` for advanced queries
- **Dynamic Query Building**: Building MongoDB queries conditionally
- **Combining Filters**: Using multiple filters together
- **Sorting**: Sorting results by different fields and directions
- **Pagination**: Combining search with pagination

---

## Base URL

```
http://localhost:5000/events/search
```

---

## Endpoint

**GET** `/events/search`

---

## Query Parameters

All parameters are **optional**. You can use any combination of them.

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search term for event title (case-insensitive partial match) | `workshop` |
| `location` | string | Filter by exact location match (case-insensitive) | `New York` |
| `dateFrom` | string | Filter events from this date onwards (YYYY-MM-DD format) | `2024-01-01` |
| `dateTo` | string | Filter events up to this date (YYYY-MM-DD format) | `2024-12-31` |
| `sortBy` | string | Field to sort by: `eventDate`, `createdAt`, or `title` (default: `createdAt`) | `eventDate` |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) | `asc` |
| `page` | number | Page number (default: 1, minimum: 1) | `1` |
| `limit` | number | Items per page (default: 10, maximum: 100) | `10` |

---

## Examples

### 1. Basic Search by Title

Search for events with "workshop" in the title:

```http
GET /events/search?search=workshop
```

**Response:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "eventId": 1,
        "title": "Web Development Workshop",
        "description": "Learn web development...",
        "eventDate": "2024-02-15T10:00:00.000Z",
        "location": "New York",
        "image": "http://localhost:5000/uploads/image.jpg",
        "timeSlots": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "filters": {
      "search": "workshop",
      "sortBy": "createdAt",
      "sortOrder": "desc"
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

---

### 2. Filter by Location

Get all events in "New York":

```http
GET /events/search?location=New York
```

---

### 3. Filter by Date Range

Get events between January 1, 2024 and December 31, 2024:

```http
GET /events/search?dateFrom=2024-01-01&dateTo=2024-12-31
```

---

### 4. Combined Filters

Search for "workshop" events in "New York" from January 2024 onwards:

```http
GET /events/search?search=workshop&location=New York&dateFrom=2024-01-01
```

---

### 5. Sort by Event Date (Ascending)

Get events sorted by event date (oldest first):

```http
GET /events/search?sortBy=eventDate&sortOrder=asc
```

---

### 6. Complete Example with All Parameters

```http
GET /events/search?search=workshop&location=New York&dateFrom=2024-01-01&dateTo=2024-12-31&sortBy=eventDate&sortOrder=asc&page=1&limit=20
```

This will:
- Search for events with "workshop" in the title
- Filter by location "New York"
- Filter events from January 1, 2024 to December 31, 2024
- Sort by event date (ascending)
- Return page 1 with 20 items per page

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
        "title": "Event Title",
        "description": "Event description",
        "eventDate": "2024-02-15T10:00:00.000Z",
        "location": "Location",
        "image": "http://localhost:5000/uploads/image.jpg",
        "timeSlots": [
          {
            "id_event_date": 1,
            "start": "15:00",
            "end": "16:00"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "filters": {
      "search": "workshop",
      "location": "New York",
      "dateFrom": "2024-01-01",
      "dateTo": "2024-12-31",
      "sortBy": "eventDate",
      "sortOrder": "asc"
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Error Responses

#### Invalid Date Format (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Invalid dateFrom format. Use YYYY-MM-DD format (e.g., 2024-01-01)"
}
```

#### Invalid Page Number (400)

```json
{
  "success": false,
  "message": "Invalid page number",
  "error": "Page 10 does not exist. Total pages: 5",
  "pagination": {
    "currentPage": 10,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10
  }
}
```

#### Database Connection Error (503)

```json
{
  "success": false,
  "message": "Database connection not available",
  "error": "Please wait a moment and try again. The database is connecting."
}
```

---

## What You'll Learn

### 1. **Query Parameters**
- How to extract query parameters from `req.query`
- How to validate and sanitize input
- How to provide default values

### 2. **MongoDB Query Operators**
- `$regex`: Pattern matching for text search
- `$options: "i"`: Case-insensitive search
- `$gte`: Greater than or equal to (for dates)
- `$lte`: Less than or equal to (for dates)

### 3. **Dynamic Query Building**
```javascript
const query = {};
if (search) {
  query.title = { $regex: search, $options: "i" };
}
if (dateFrom) {
  query.eventDate = { $gte: new Date(dateFrom) };
}
```

### 4. **Combining Filters**
- Multiple filters can be combined in a single query object
- MongoDB automatically applies AND logic between filters

### 5. **Sorting**
- Dynamic sort object building
- Sorting by different fields
- Ascending vs descending order

### 6. **Pagination with Filters**
- Counting filtered results
- Calculating total pages based on filtered results
- Skipping and limiting filtered results

---

## Testing with Postman

1. **Open Postman** and create a new GET request
2. **Set URL**: `http://localhost:5000/events/search`
3. **Go to Params tab** and add query parameters:
   - Key: `search`, Value: `workshop`
   - Key: `location`, Value: `New York`
   - Key: `dateFrom`, Value: `2024-01-01`
   - Key: `sortBy`, Value: `eventDate`
   - Key: `sortOrder`, Value: `asc`
   - Key: `page`, Value: `1`
   - Key: `limit`, Value: `10`
4. **Click Send**

---

## Advanced Usage Tips

1. **Empty Search**: If you don't provide any filters, it returns all events (same as `/events`)
2. **Partial Matches**: The `search` parameter does partial matching, so "work" will match "workshop"
3. **Date Format**: Always use `YYYY-MM-DD` format for dates
4. **Case Insensitive**: Location and title searches are case-insensitive
5. **Combining Filters**: You can combine any filters together for precise results

---

## Next Steps to Learn

After mastering this API, you could learn:
1. **Update Event API** (PUT/PATCH) - Learn how to update existing resources
2. **Advanced Aggregation** - Learn MongoDB aggregation pipelines
3. **Full-Text Search** - Implement more advanced text search
4. **Geolocation Search** - Search events by location coordinates
5. **Faceted Search** - Return filter options and counts

---

## Code Location

- **Controller**: `controllers/eventController.js` - `searchEvents` function
- **Route**: `routes/eventRoutes.js` - `GET /events/search`

---

Happy Learning! 🚀

