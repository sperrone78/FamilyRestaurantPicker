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
    cuisineId: number;
    preferenceLevel: number;
  }[];
}

export interface UpdateFamilyMemberRequest {
  name?: string;
  email?: string;
  dietaryRestrictions?: string[];
  cuisinePreferences?: {
    cuisineId: number;
    preferenceLevel: number;
  }[];
}

export interface Restaurant {
  id: string;
  familyId: string;
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

export interface DietaryAccommodation {
  id: number;
  name: string;
  notes?: string;
}

export interface RecommendationRequest {
  memberIds: number[];
  filters?: {
    maxPriceRange?: number;
    minRating?: number;
    cuisineIds?: number[];
  };
}

export interface RecommendationResponse {
  recommendations: RestaurantRecommendation[];
  summary: RecommendationSummary;
  fallbackMode?: 'filters_removed' | 'all_filters_removed' | 'member_removed';
  originalFilters?: {
    maxPriceRange?: number;
    minRating?: number;
    cuisineIds?: number[];
  };
  removedMember?: {
    id: number;
    name: string;
    restrictionCount: number;
  };
  originalMemberIds?: number[];
}

export interface RestaurantRecommendation {
  restaurant: Restaurant;
  score: number;
  reasons: string[];
  accommodatedMembers: number[];
  missedRestrictions: DietaryRestriction[];
}

export interface RecommendationSummary {
  totalMembers: number;
  commonDietaryRestrictions: {
    id: number;
    name: string;
    memberCount: number;
  }[];
  topCuisinePreferences: {
    cuisineId: number;
    cuisineName: string;
    averagePreference: number;
  }[];
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