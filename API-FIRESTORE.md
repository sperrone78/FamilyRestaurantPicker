# Firestore Services Documentation

This application uses Firebase Firestore services instead of traditional REST APIs. All data operations are performed through TypeScript service modules.

## Authentication

Firebase Authentication is required for all data operations. Users must be signed in to access any features.

## Service Modules

### familyMembersService

Manages family member data scoped to the user's family.

```typescript
// Get all family members for a family
familyMembersService.getAll(familyId: string): Promise<FamilyMember[]>

// Create a new family member
familyMembersService.create(data: CreateFamilyMemberRequest & { familyId: string }): Promise<FamilyMember>

// Update an existing family member
familyMembersService.update(id: string, data: UpdateFamilyMemberRequest): Promise<FamilyMember>

// Delete a family member
familyMembersService.delete(id: string): Promise<void>
```

### restaurantsService

Manages global restaurant data with populated cuisine and dietary accommodation information.

```typescript
// Get all restaurants with populated cuisine and dietary data
restaurantsService.getAll(): Promise<Restaurant[]>

// Create a new restaurant (admin only)
restaurantsService.create(data: any): Promise<Restaurant>

// Update an existing restaurant (admin only)
restaurantsService.update(id: string, data: any): Promise<Restaurant>

// Delete a restaurant (admin only)
restaurantsService.delete(id: string): Promise<void>
```

### favoritesService (NEW)

Manages user-specific restaurant favorites.

```typescript
// Get all favorites for a user
favoritesService.getUserFavorites(userId: string): Promise<RestaurantFavorite[]>

// Check if a restaurant is favorited by a user
favoritesService.isFavorite(userId: string, restaurantId: string): Promise<boolean>

// Add a restaurant to favorites
favoritesService.addFavorite(userId: string, restaurantId: string): Promise<RestaurantFavorite>

// Remove a restaurant from favorites
favoritesService.removeFavorite(userId: string, restaurantId: string): Promise<void>
```

### commentsService (NEW)

Manages user-specific restaurant comments.

```typescript
// Get all comments for a specific restaurant by a user
commentsService.getRestaurantComments(restaurantId: string, userId: string): Promise<RestaurantComment[]>

// Get all comments by a specific user
commentsService.getUserComments(userId: string): Promise<RestaurantComment[]>

// Add a new comment
commentsService.addComment(userId: string, data: CreateCommentRequest): Promise<RestaurantComment>

// Update an existing comment
commentsService.updateComment(commentId: string, data: UpdateCommentRequest): Promise<RestaurantComment>

// Delete a comment
commentsService.deleteComment(commentId: string): Promise<void>
```

### referenceDataService

Manages global reference data (cuisines and dietary restrictions).

```typescript
// Get all dietary restrictions
referenceDataService.getDietaryRestrictions(): Promise<DietaryRestriction[]>

// Get all cuisines
referenceDataService.getCuisines(): Promise<Cuisine[]>
```

## Data Types

### Core Types

```typescript
interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  email?: string;
  dietaryRestrictions?: DietaryRestriction[];
  cuisinePreferences?: CuisinePreference[];
  createdAt: string;
  updatedAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  cuisine?: Cuisine;
  priceRange?: number;
  rating?: number;
  website?: string;
  notes?: string;
  dietaryAccommodations?: DietaryAccommodation[];
  createdAt: string;
  updatedAt?: string;
}

interface RestaurantWithUserData extends Restaurant {
  isFavorite?: boolean;
  userComments?: RestaurantComment[];
}
```

### Favorites & Comments Types (NEW)

```typescript
interface RestaurantFavorite {
  id: string;
  userId: string;
  restaurantId: string;
  createdAt: string;
}

interface RestaurantComment {
  id: string;
  userId: string;
  restaurantId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCommentRequest {
  restaurantId: string;
  content: string;
}

interface UpdateCommentRequest {
  content: string;
}
```

## Usage Examples

### Adding a Favorite

```typescript
import { favoritesService } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

const { user, currentFamily } = useAuth();

const handleAddFavorite = async (restaurantId: string) => {
  if (!user) return;
  
  try {
    await favoritesService.addFavorite(user.uid, restaurantId);
    console.log('Restaurant added to favorites!');
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
};
```

### Adding a Comment

```typescript
import { commentsService } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

const { user, currentFamily } = useAuth();

const handleAddComment = async (restaurantId: string, content: string) => {
  if (!user) return;
  
  try {
    const comment = await commentsService.addComment(
      user.uid, 
      { restaurantId, content }
    );
    console.log('Comment added:', comment);
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};
```

### Loading Restaurants with User Data

```typescript
import { restaurantsService, favoritesService } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

const { user, currentFamily } = useAuth();

const loadRestaurantsWithUserData = async () => {
  if (!user) return;
  
  try {
    // Get all restaurants
    const restaurants = await restaurantsService.getAll();
    
    // Get user favorites
    const favorites = await favoritesService.getUserFavorites(user.uid);
    const favoriteIds = new Set(favorites.map(f => f.restaurantId));
    
    // Combine data
    const restaurantsWithUserData = restaurants.map(restaurant => ({
      ...restaurant,
      isFavorite: favoriteIds.has(restaurant.id)
    }));
    
    return restaurantsWithUserData;
  } catch (error) {
    console.error('Error loading data:', error);
  }
};
```

## Error Handling

All service methods return Promises that should be wrapped in try-catch blocks for proper error handling:

```typescript
try {
  const result = await someService.someMethod();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error (show user message, retry, etc.)
}
```

## Data Security

- All operations require authentication via Firebase Auth
- Users can only access data scoped to their user ID
- Comments and favorites are private to each user
- Restaurants are globally readable but admin-managed
- Firestore security rules enforce data access permissions