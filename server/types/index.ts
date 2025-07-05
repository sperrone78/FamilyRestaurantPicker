export interface FamilyMember {
  id: number;
  name: string;
  email?: string;
  dietaryRestrictions?: DietaryRestriction[];
  cuisinePreferences?: CuisinePreference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DietaryRestriction {
  id: number;
  name: string;
  description?: string;
}

export interface Cuisine {
  id: number;
  name: string;
  description?: string;
}

export interface CuisinePreference {
  cuisineId: number;
  cuisineName: string;
  preferenceLevel: number;
}

export interface Restaurant {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  cuisine?: Cuisine;
  priceRange?: number;
  rating?: number;
  website?: string;
  notes?: string;
  dietaryAccommodations?: DietaryAccommodation[];
  createdAt: Date;
  updatedAt?: Date;
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

export interface CreateFamilyMemberRequest {
  name: string;
  email?: string;
  dietaryRestrictions?: number[];
  cuisinePreferences?: {
    cuisineId: number;
    preferenceLevel: number;
  }[];
}

export interface UpdateFamilyMemberRequest {
  name?: string;
  email?: string;
  dietaryRestrictions?: number[];
  cuisinePreferences?: {
    cuisineId: number;
    preferenceLevel: number;
  }[];
}

export interface CreateRestaurantRequest {
  name: string;
  address?: string;
  phone?: string;
  cuisineId?: number;
  priceRange?: number;
  rating?: number;
  website?: string;
  notes?: string;
  dietaryAccommodations?: {
    dietaryRestrictionId: number;
    notes?: string;
  }[];
}

export interface UpdateRestaurantRequest {
  name?: string;
  address?: string;
  phone?: string;
  cuisineId?: number;
  priceRange?: number;
  rating?: number;
  website?: string;
  notes?: string;
  dietaryAccommodations?: {
    dietaryRestrictionId: number;
    notes?: string;
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

export interface DatabaseQueryResult {
  rows: any[];
  rowCount: number;
}