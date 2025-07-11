export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  email?: string;
  dietaryRestrictions?: DietaryRestriction[];
  cuisinePreferences?: CuisinePreference[];
  createdAt: string;
  updatedAt: string;
}

export interface DietaryRestriction {
  id: string;
  name: string;
  description?: string;
}

export interface Cuisine {
  id: string;
  name: string;
  description?: string;
}

export interface CuisinePreference {
  cuisineId: string;
  cuisineName: string;
  preferenceLevel: number;
}

export interface CreateFamilyMemberRequest {
  name: string;
  email?: string;
  dietaryRestrictions?: string[];
  cuisinePreferences?: {
    cuisineId: string;
    preferenceLevel: number;
  }[];
}

export interface UpdateFamilyMemberRequest {
  name?: string;
  email?: string;
  dietaryRestrictions?: string[];
  cuisinePreferences?: {
    cuisineId: string;
    preferenceLevel: number;
  }[];
}

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  cuisine?: Cuisine; // Keep for backward compatibility
  cuisines?: Cuisine[]; // New: multiple cuisine tags
  priceRange?: number;
  rating?: number;
  website?: string;
  notes?: string;
  dietaryAccommodations?: DietaryAccommodation[];
  createdAt: string;
  updatedAt?: string;
}

export interface DietaryAccommodation {
  id: string;
  dietaryRestrictionId: string;
  name: string;
  notes?: string;
}

export interface RecommendationRequest {
  memberIds: string[];
  filters?: {
    maxPriceRange?: number;
    minRating?: number;
    cuisineIds?: string[];
  };
}

export interface RecommendationResponse {
  recommendations: RestaurantRecommendation[];
  summary: RecommendationSummary;
  fallbackMode?: 'filters_removed' | 'all_filters_removed' | 'member_removed';
  originalFilters?: {
    maxPriceRange?: number;
    minRating?: number;
    cuisineIds?: string[];
  };
  removedMember?: {
    id: string;
    name: string;
    restrictionCount: number;
  };
  originalMemberIds?: string[];
}

export interface RestaurantRecommendation {
  restaurant: Restaurant;
  score: number;
  percentage: number;
  maxPossible: number;
  reasons: string[];
  accommodatedMembers: string[];
  missedRestrictions: DietaryRestriction[];
}

export interface RecommendationSummary {
  totalMembers: number;
  commonDietaryRestrictions: {
    id: string;
    name: string;
    memberCount: number;
  }[];
  topCuisinePreferences: {
    cuisineId: string;
    cuisineName: string;
    averagePreference: number;
  }[];
}

export interface RestaurantFavorite {
  id: string;
  userId: string;
  restaurantId: string;
  createdAt: string;
}

export interface RestaurantComment {
  id: string;
  userId: string;
  restaurantId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  restaurantId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface RestaurantWithUserData extends Restaurant {
  isFavorite?: boolean;
  userComments?: RestaurantComment[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}