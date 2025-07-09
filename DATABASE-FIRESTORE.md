# Firestore Database Schema

This application uses Firebase Firestore, a NoSQL document database. Below are the collections and their document structures.

## Collections

### familyMembers

Stores information about family members and their dining preferences.

```typescript
{
  id: string;                    // Auto-generated document ID
  familyId: string;             // Reference to user's family
  name: string;                 // Member's name
  email?: string;               // Optional email
  dietaryRestrictions?: string[]; // Array of dietary restriction IDs
  cuisinePreferences?: Array<{   // Cuisine preferences with ratings
    cuisineId: string;
    preferenceLevel: number;     // 1-5 scale
  }>;
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}
```

### restaurants

Stores restaurant information as global reference data.

```typescript
{
  id: string;                   // Auto-generated document ID
  name: string;                // Restaurant name
  address?: string;            // Restaurant address
  phone?: string;              // Phone number
  cuisineId?: string;          // Reference to cuisine document
  priceRange?: number;         // 1-4 scale ($ to $$$$)
  rating?: number;             // 0-5 scale with decimals
  website?: string;            // Restaurant website URL
  notes?: string;              // Additional notes
  dietaryAccommodations?: Array<{  // Dietary restrictions accommodated
    dietaryRestrictionId: string;
    notes?: string;            // Specific accommodation notes
  }>;
  createdAt: string;           // ISO timestamp
  updatedAt?: string;          // ISO timestamp
}
```

### cuisines

Stores different types of cuisine.

```typescript
{
  id: string;                  // Auto-generated document ID
  name: string;                // Cuisine name (e.g., "Italian", "Mexican")
  description?: string;        // Cuisine description
  createdAt: string;           // ISO timestamp
}
```

### dietaryRestrictions

Stores available dietary restrictions.

```typescript
{
  id: string;                  // Auto-generated document ID
  name: string;                // Restriction name (e.g., "Gluten Free")
  description?: string;        // Restriction description
  createdAt: string;           // ISO timestamp
}
```

### restaurantFavorites

Stores user favorites for restaurants (user-specific data).

```typescript
{
  id: string;                  // Auto-generated document ID
  userId: string;              // Firebase Auth user ID
  restaurantId: string;        // Reference to restaurant document
  createdAt: string;           // ISO timestamp
}
```

### restaurantComments

Stores user comments on restaurants (user-specific data).

```typescript
{
  id: string;                  // Auto-generated document ID
  userId: string;              // Firebase Auth user ID
  restaurantId: string;        // Reference to restaurant document
  content: string;             // Comment text (max 500 characters)
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
}
```

## Default Data

### Dietary Restrictions

The following dietary restrictions are seeded by default:

- Gluten Free
- Vegetarian
- Vegan
- Dairy Free
- Nut Allergy
- Shellfish Allergy
- Kosher
- Halal
- Low Sodium
- Diabetic Friendly

### Cuisines

The following cuisines are seeded by default:

**Traditional Cuisines:**
- American
- Italian
- Mexican
- Chinese
- Japanese
- Indian
- Thai
- Mediterranean
- French
- Greek
- Vietnamese
- Korean
- BBQ
- Seafood
- Steakhouse

**Specialty Food Categories (Added 2025-01-08):**
- **Dessert & Ice Cream** - Ice cream shops, dessert parlors, specialty sweet treats
- **Bakery & Pastries** - Bakeries, pastry shops, fresh baked goods
- **Cafe & Coffee** - Coffee shops, cafes, light breakfast/lunch spots

## Data Access Patterns

### User-Specific Data
- **Favorites**: Filtered by `userId`
- **Comments**: Filtered by `userId`
- Comments are only visible to the user who created them

### Family-Scoped Data
- **Family Members**: Filtered by `familyId`

### Global Reference Data
- **Restaurants**: Shared across all users (admin-managed)
- **Cuisines**: Shared across all users
- **Dietary Restrictions**: Shared across all users

## Firestore Security Rules

The application uses Firebase Authentication to secure data access:

```javascript
// Example security rules (simplified)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own family data
    match /familyMembers/{memberId} {
      allow read, write: if request.auth != null && 
        resource.data.familyId == request.auth.uid;
    }
    
    match /restaurants/{restaurantId} {
      allow read: if request.auth != null;
      // Restaurants are admin-managed, no user write access
    }
    
    // Users can only access their own favorites and comments
    match /restaurantFavorites/{favoriteId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /restaurantComments/{commentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Reference data is read-only for authenticated users
    match /cuisines/{cuisineId} {
      allow read: if request.auth != null;
    }
    
    match /dietaryRestrictions/{restrictionId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Migration Scripts

Use the following scripts to populate initial data:

```bash
# Migrate basic collections (cuisines, dietary restrictions, sample restaurants)
node scripts/migrate-to-firestore.js

# Add more restaurant data for a specific user
node scripts/add-bloomington-restaurants-firestore.js YOUR_USER_ID

# Add specialty cuisine categories and update restaurants
node scripts/add-specialty-cuisines.js YOUR_USER_ID
```