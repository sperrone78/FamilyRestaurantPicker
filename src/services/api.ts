import axios from 'axios';
import { 
  FamilyMember, 
  DietaryRestriction, 
  Cuisine, 
  Restaurant,
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  RecommendationRequest,
  RecommendationResponse,
  ApiResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Family Members API
export const familyMembersApi = {
  getAll: async (): Promise<FamilyMember[]> => {
    const response = await api.get<ApiResponse<FamilyMember[]>>('/family-members');
    return response.data.data || [];
  },

  getById: async (id: number): Promise<FamilyMember> => {
    const response = await api.get<ApiResponse<FamilyMember>>(`/family-members/${id}`);
    if (!response.data.data) {
      throw new Error('Family member not found');
    }
    return response.data.data;
  },

  create: async (data: CreateFamilyMemberRequest): Promise<FamilyMember> => {
    const response = await api.post<ApiResponse<FamilyMember>>('/family-members', data);
    if (!response.data.data) {
      throw new Error('Failed to create family member');
    }
    return response.data.data;
  },

  update: async (id: number, data: UpdateFamilyMemberRequest): Promise<FamilyMember> => {
    const response = await api.put<ApiResponse<FamilyMember>>(`/family-members/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update family member');
    }
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/family-members/${id}`);
  },
};

// Restaurants API
export const restaurantsApi = {
  getAll: async (filters?: {
    cuisine?: number;
    dietary?: number;
    rating?: number;
  }): Promise<Restaurant[]> => {
    const params = new URLSearchParams();
    if (filters?.cuisine) params.append('cuisine', filters.cuisine.toString());
    if (filters?.dietary) params.append('dietary', filters.dietary.toString());
    if (filters?.rating) params.append('rating', filters.rating.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<ApiResponse<Restaurant[]>>(`/restaurants${queryString}`);
    return response.data.data || [];
  },

  getById: async (id: number): Promise<Restaurant> => {
    const response = await api.get<ApiResponse<Restaurant>>(`/restaurants/${id}`);
    if (!response.data.data) {
      throw new Error('Restaurant not found');
    }
    return response.data.data;
  },
};

// Reference Data API
export const referenceDataApi = {
  getDietaryRestrictions: async (): Promise<DietaryRestriction[]> => {
    const response = await api.get<ApiResponse<DietaryRestriction[]>>('/dietary-restrictions');
    return response.data.data || [];
  },

  getCuisines: async (): Promise<Cuisine[]> => {
    const response = await api.get<ApiResponse<Cuisine[]>>('/cuisines');
    return response.data.data || [];
  },
};

// Recommendations API
export const recommendationsApi = {
  getRecommendations: async (request: RecommendationRequest): Promise<RecommendationResponse> => {
    const response = await api.post<ApiResponse<RecommendationResponse>>('/recommendations', request);
    if (!response.data.data) {
      throw new Error('Failed to get recommendations');
    }
    return response.data.data;
  },
};

export default api;