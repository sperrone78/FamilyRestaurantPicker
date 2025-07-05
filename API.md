# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

Currently, no authentication is required. This may be added in future versions.

## Family Members

### GET /family-members

Get all family members with their dietary restrictions and preferences.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "dietaryRestrictions": [
        {
          "id": 1,
          "name": "Gluten Free",
          "description": "Cannot consume gluten-containing foods"
        }
      ],
      "cuisinePreferences": [
        {
          "cuisineId": 1,
          "cuisineName": "Italian",
          "preferenceLevel": 5
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /family-members

Create a new family member.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "dietaryRestrictions": [1, 2],
  "cuisinePreferences": [
    {
      "cuisineId": 1,
      "preferenceLevel": 4
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /family-members/:id

Update an existing family member.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "dietaryRestrictions": [1],
  "cuisinePreferences": [
    {
      "cuisineId": 1,
      "preferenceLevel": 5
    }
  ]
}
```

### DELETE /family-members/:id

Delete a family member.

**Response:**
```json
{
  "success": true,
  "message": "Family member deleted successfully"
}
```

## Restaurants

### GET /restaurants

Get all restaurants with their dietary accommodations.

**Query Parameters:**
- `cuisine` (optional): Filter by cuisine ID
- `dietary` (optional): Filter by dietary restriction ID
- `rating` (optional): Minimum rating filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "address": "123 Main St",
      "phone": "555-0123",
      "cuisine": {
        "id": 2,
        "name": "Italian"
      },
      "priceRange": 2,
      "rating": 4.5,
      "website": "https://pizzapalace.com",
      "notes": "Great gluten-free options",
      "dietaryAccommodations": [
        {
          "id": 1,
          "name": "Gluten Free",
          "notes": "Gluten-free pizza available"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /restaurants

Create a new restaurant.

**Request Body:**
```json
{
  "name": "Burger Joint",
  "address": "456 Oak Ave",
  "phone": "555-0456",
  "cuisineId": 1,
  "priceRange": 2,
  "rating": 4.0,
  "website": "https://burgerjoint.com",
  "notes": "Good vegetarian options",
  "dietaryAccommodations": [
    {
      "dietaryRestrictionId": 2,
      "notes": "Veggie burgers available"
    }
  ]
}
```

### PUT /restaurants/:id

Update an existing restaurant.

### DELETE /restaurants/:id

Delete a restaurant.

## Recommendations

### POST /recommendations

Get restaurant recommendations based on selected family members.

**Request Body:**
```json
{
  "memberIds": [1, 2, 3],
  "filters": {
    "maxPriceRange": 3,
    "minRating": 4.0,
    "cuisineIds": [1, 2]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "restaurant": {
          "id": 1,
          "name": "Pizza Palace",
          "address": "123 Main St",
          "cuisine": {
            "id": 2,
            "name": "Italian"
          },
          "priceRange": 2,
          "rating": 4.5
        },
        "score": 85,
        "reasons": [
          "Accommodates all dietary restrictions",
          "High preference match for Italian cuisine",
          "Excellent rating"
        ],
        "accommodatedMembers": [1, 2, 3],
        "missedRestrictions": []
      }
    ],
    "summary": {
      "totalMembers": 3,
      "commonDietaryRestrictions": [
        {
          "id": 1,
          "name": "Gluten Free",
          "memberCount": 2
        }
      ],
      "topCuisinePreferences": [
        {
          "cuisineId": 2,
          "cuisineName": "Italian",
          "averagePreference": 4.5
        }
      ]
    }
  }
}
```

## Reference Data

### GET /dietary-restrictions

Get all available dietary restrictions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Gluten Free",
      "description": "Cannot consume gluten-containing foods"
    }
  ]
}
```

### GET /cuisines

Get all available cuisines.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "American",
      "description": "Traditional American cuisine"
    }
  ]
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error