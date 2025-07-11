import { 
  FamilyMember, 
  DietaryRestriction, 
  Cuisine, 
  Restaurant,
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  RecommendationRequest,
  RecommendationResponse,
  RecommendationSummary
} from '../types';
import { familyMembersService, restaurantsService, referenceDataService } from './firestore';

// Helper to get current user's family ID
const getUserFamilyId = (userId: string): string => {
  // For now, use user ID as family ID (auto-created family)
  // In a full implementation, this would fetch from families collection
  return userId;
};

// Family Members API
export const familyMembersApi = {
  getAll: async (userId: string): Promise<FamilyMember[]> => {
    const familyId = getUserFamilyId(userId);
    return familyMembersService.getAll(familyId);
  },

  getById: async (_id: string): Promise<FamilyMember> => {
    // For now, this would need to be implemented in firestore service
    throw new Error('getById not implemented yet');
  },

  create: async (userId: string, data: CreateFamilyMemberRequest): Promise<FamilyMember> => {
    const familyId = getUserFamilyId(userId);
    return familyMembersService.create({ ...data, familyId });
  },

  update: async (id: string, data: UpdateFamilyMemberRequest): Promise<FamilyMember> => {
    return familyMembersService.update(id, data);
  },

  delete: async (id: string): Promise<void> => {
    await familyMembersService.delete(id);
  },
};

// Restaurants API
export const restaurantsApi = {
  getAll: async (): Promise<Restaurant[]> => {
    // The restaurantsService.getAll() already populates cuisine and dietary accommodations
    return restaurantsService.getAll();
  },

  getById: async (_id: string): Promise<Restaurant> => {
    throw new Error('getById not implemented yet');
  },
};

// Reference Data API
export const referenceDataApi = {
  getDietaryRestrictions: async (): Promise<DietaryRestriction[]> => {
    return referenceDataService.getDietaryRestrictions();
  },

  getCuisines: async (): Promise<Cuisine[]> => {
    return referenceDataService.getCuisines();
  },
};

// Recommendations API
export const recommendationsApi = {
  getRecommendations: async (userId: string, request: RecommendationRequest): Promise<RecommendationResponse> => {
    
    try {
      // Get family members data
      const allFamilyMembers = await familyMembersApi.getAll(userId);
      const selectedMembers = allFamilyMembers.filter(member => 
        request.memberIds.includes(member.id)
      );
      
      if (selectedMembers.length === 0) {
        throw new Error('No valid family members found for the provided IDs');
      }
      
      // Get all restaurants
      const allRestaurants = await restaurantsApi.getAll();
      
      // Get reference data
      const [, allCuisines] = await Promise.all([
        referenceDataApi.getDietaryRestrictions(),
        referenceDataApi.getCuisines()
      ]);
      
      // Build lookup maps
      const cuisineMap = new Map(allCuisines.map(c => [c.id, c]));
      
      // Get all dietary restrictions from selected members
      const allMemberRestrictions = selectedMembers
        .flatMap(member => member.dietaryRestrictions || [])
        .filter((restriction, index, self) => 
          self.findIndex(r => r.id === restriction.id) === index
        );
      
      // Score and filter restaurants
      const scoredRestaurants = allRestaurants.map(restaurant => {
        const scoreResult = calculateRestaurantScore(
          restaurant, 
          selectedMembers, 
          allMemberRestrictions
        );
        
        const reasons = generateReasons(restaurant, selectedMembers);
        const accommodatedMembers = getAccommodatedMembers(restaurant, selectedMembers);
        const missedRestrictions = getMissedRestrictions(restaurant, allMemberRestrictions);
        
        return {
          restaurant,
          score: scoreResult.score,
          percentage: scoreResult.percentage,
          maxPossible: scoreResult.maxPossible,
          reasons,
          accommodatedMembers,
          missedRestrictions
        };
      });
      
      // Apply filters
      const filteredRestaurants = scoredRestaurants.filter(item => {
        const { restaurant } = item;
        
        // Apply price range filter
        if (request.filters?.maxPriceRange && restaurant.priceRange && restaurant.priceRange > request.filters.maxPriceRange) {
          return false;
        }
        
        // Apply rating filter
        if (request.filters?.minRating && restaurant.rating && restaurant.rating < request.filters.minRating) {
          return false;
        }
        
        // Apply cuisine filter - check against all restaurant cuisines
        if (request.filters?.cuisineIds && request.filters.cuisineIds.length > 0) {
          const restaurantCuisines = restaurant.cuisines || (restaurant.cuisine ? [restaurant.cuisine] : []);
          const hasMatchingCuisine = restaurantCuisines.some(cuisine => 
            request.filters!.cuisineIds!.includes(cuisine.id)
          );
          
          if (!hasMatchingCuisine) {
            return false;
          }
        }
        
        return true;
      });
      
      // Sort by score (highest first)
      filteredRestaurants.sort((a, b) => b.score - a.score);
      
      // Generate summary
      const summary = generateSummary(selectedMembers, allMemberRestrictions, cuisineMap);
      
      return {
        recommendations: filteredRestaurants,
        summary
      };
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  },
};

// Helper function to calculate restaurant score
function calculateRestaurantScore(
  restaurant: Restaurant, 
  members: FamilyMember[], 
  allRestrictions: DietaryRestriction[]
): { score: number; percentage: number; maxPossible: number } {
  let score = 0;
  let maxPossible = 0;
  
  // Base score from restaurant rating (max 100 points)
  maxPossible += 100;
  if (restaurant.rating) {
    score += restaurant.rating * 20;
  }
  
  // Dietary accommodations score (30 points per restriction)
  const maxAccommodationScore = allRestrictions.length * 30;
  maxPossible += maxAccommodationScore;
  
  const restaurantAccommodations = restaurant.dietaryAccommodations || [];
  const accommodationIds = restaurantAccommodations.map(acc => acc.dietaryRestrictionId);
  
  let accommodationScore = 0;
  for (const restriction of allRestrictions) {
    const restrictionId = typeof restriction === 'string' ? restriction : restriction.id;
    if (accommodationIds.includes(restrictionId)) {
      accommodationScore += 30;
    }
  }
  score += accommodationScore;
  
  // Cuisine preference score (max 50 points per member who has this cuisine preference)
  let maxCuisineScore = 0;
  let cuisineScore = 0;
  
  for (const member of members) {
    if (member.cuisinePreferences) {
      // Check against all cuisines (new format) or single cuisine (backward compatibility)
      const restaurantCuisines = restaurant.cuisines || (restaurant.cuisine ? [restaurant.cuisine] : []);
      
      let memberHasMatchingCuisine = false;
      let bestPreferenceLevel = 0;
      
      for (const restaurantCuisine of restaurantCuisines) {
        const pref = member.cuisinePreferences.find(pref => pref.cuisineId === restaurantCuisine.id);
        if (pref) {
          memberHasMatchingCuisine = true;
          bestPreferenceLevel = Math.max(bestPreferenceLevel, pref.preferenceLevel);
        }
      }
      
      if (memberHasMatchingCuisine) {
        maxCuisineScore += 50; // Max 50 points per member with matching cuisine preference
        cuisineScore += bestPreferenceLevel * 10;
      }
    }
  }
  maxPossible += maxCuisineScore;
  score += cuisineScore;
  
  // Price range bonus (max 15 points for price range 1)
  maxPossible += 15;
  if (restaurant.priceRange) {
    score += (4 - restaurant.priceRange) * 5;
  }
  
  const finalScore = Math.round(score);
  const percentage = maxPossible > 0 ? Math.round((finalScore / maxPossible) * 100) : 0;
  
  // Debug logging for score calculation
  console.log(`Score for ${restaurant.name}:`, {
    rating: restaurant.rating,
    ratingScore: restaurant.rating ? restaurant.rating * 20 : 0,
    maxRatingScore: 100,
    accommodationScore: accommodationScore,
    maxAccommodationScore: maxAccommodationScore,
    cuisineScore: cuisineScore,
    maxCuisineScore: maxCuisineScore,
    priceScore: restaurant.priceRange ? (4 - restaurant.priceRange) * 5 : 0,
    maxPriceScore: 15,
    finalScore,
    maxPossible,
    percentage: `${percentage}%`
  });
  
  return { score: finalScore, percentage, maxPossible };
}

// Helper function to generate reasons for recommendation
function generateReasons(
  restaurant: Restaurant, 
  members: FamilyMember[]
): string[] {
  const reasons: string[] = [];
  
  // Rating reason
  if (restaurant.rating && restaurant.rating >= 4.0) {
    reasons.push(`Highly rated (${restaurant.rating}★)`);
  }
  
  // Dietary accommodations
  const accommodationCount = restaurant.dietaryAccommodations?.length || 0;
  if (accommodationCount > 0) {
    reasons.push(`Accommodates ${accommodationCount} dietary restriction${accommodationCount > 1 ? 's' : ''}`);
  }
  
  // Cuisine preferences - handle multiple cuisines
  const restaurantCuisines = restaurant.cuisines || (restaurant.cuisine ? [restaurant.cuisine] : []);
  
  if (restaurantCuisines.length > 0) {
    const likedCuisines = new Set<string>();
    let totalMembersWhoLike = 0;
    
    for (const cuisine of restaurantCuisines) {
      const membersWhoLikeCuisine = members.filter(member => 
        member.cuisinePreferences?.some(pref => 
          pref.cuisineId === cuisine.id && pref.preferenceLevel >= 4
        )
      );
      
      if (membersWhoLikeCuisine.length > 0) {
        likedCuisines.add(cuisine.name);
        totalMembersWhoLike = Math.max(totalMembersWhoLike, membersWhoLikeCuisine.length);
      }
    }
    
    if (likedCuisines.size > 0) {
      const cuisineNames = Array.from(likedCuisines).join(', ');
      reasons.push(`${totalMembersWhoLike} member${totalMembersWhoLike > 1 ? 's' : ''} like${totalMembersWhoLike === 1 ? 's' : ''} ${cuisineNames} cuisine`);
    }
  }
  
  // Price range
  if (restaurant.priceRange && restaurant.priceRange <= 2) {
    reasons.push('Budget-friendly option');
  }
  
  return reasons;
}

// Helper function to get accommodated members
function getAccommodatedMembers(restaurant: Restaurant, members: FamilyMember[]): string[] {
  const accommodationIds = restaurant.dietaryAccommodations?.map(acc => acc.dietaryRestrictionId) || [];
  
  return members
    .filter(member => {
      // Check dietary restrictions are met
      const memberRestrictions = member.dietaryRestrictions || [];
      const dietaryRequirementsMet = memberRestrictions.every(restriction => {
        const restrictionId = typeof restriction === 'string' ? restriction : restriction.id;
        return accommodationIds.includes(restrictionId);
      });
      
      // Check if member has positive preference for any of the restaurant's cuisines (3+ rating)
      const memberPreferences = member.cuisinePreferences || [];
      const restaurantCuisines = restaurant.cuisines || (restaurant.cuisine ? [restaurant.cuisine] : []);
      
      let cuisinePreferenceMet = true; // Default to true if no cuisines
      let bestPreferenceLevel = 0;
      
      if (restaurantCuisines.length > 0) {
        // Check if member has preference for any of the restaurant's cuisines
        const matchingPreferences = memberPreferences.filter(pref => 
          restaurantCuisines.some(cuisine => cuisine.id === pref.cuisineId)
        );
        
        if (matchingPreferences.length > 0) {
          // Member has preferences for some cuisines - check if any are positive (3+)
          bestPreferenceLevel = Math.max(...matchingPreferences.map(pref => pref.preferenceLevel));
          cuisinePreferenceMet = bestPreferenceLevel >= 3;
        } else {
          // Member has no preferences for any of the restaurant's cuisines - neutral
          cuisinePreferenceMet = true;
        }
      }
      
      // Debug logging
      console.log(`Member ${member.name}:`, {
        memberRestrictions: memberRestrictions.map(r => typeof r === 'string' ? r : r.id),
        memberRestrictionsRaw: memberRestrictions,
        accommodationIds,
        dietaryRequirementsMet,
        restaurantCuisines: restaurantCuisines.map(c => c.name),
        bestPreferenceLevel,
        cuisinePreferenceMet,
        finalResult: dietaryRequirementsMet && cuisinePreferenceMet
      });
      
      return dietaryRequirementsMet && cuisinePreferenceMet;
    })
    .map(member => member.id);
}

// Helper function to get missed restrictions (only for restrictions needed by selected members)
function getMissedRestrictions(
  restaurant: Restaurant, 
  neededRestrictions: DietaryRestriction[]
): DietaryRestriction[] {
  const accommodationIds = restaurant.dietaryAccommodations?.map(acc => acc.dietaryRestrictionId) || [];
  
  return neededRestrictions.filter(restriction => 
    !accommodationIds.includes(restriction.id)
  );
}

// Helper function to generate summary
function generateSummary(
  members: FamilyMember[], 
  allRestrictions: DietaryRestriction[],
  cuisineMap: Map<string, Cuisine>
): RecommendationSummary {
  // Count dietary restrictions
  const restrictionCounts = new Map<string, number>();
  
  for (const member of members) {
    if (member.dietaryRestrictions) {
      for (const restriction of member.dietaryRestrictions) {
        restrictionCounts.set(restriction.id, (restrictionCounts.get(restriction.id) || 0) + 1);
      }
    }
  }
  
  const commonDietaryRestrictions = Array.from(restrictionCounts.entries())
    .map(([id, count]) => ({
      id,
      name: allRestrictions.find(r => r.id === id)?.name || 'Unknown',
      memberCount: count
    }))
    .sort((a, b) => b.memberCount - a.memberCount);
  
  // Calculate cuisine preferences
  const cuisinePreferences = new Map<string, { total: number, count: number }>();
  
  for (const member of members) {
    if (member.cuisinePreferences) {
      for (const pref of member.cuisinePreferences) {
        const current = cuisinePreferences.get(pref.cuisineId) || { total: 0, count: 0 };
        cuisinePreferences.set(pref.cuisineId, {
          total: current.total + pref.preferenceLevel,
          count: current.count + 1
        });
      }
    }
  }
  
  const topCuisinePreferences = Array.from(cuisinePreferences.entries())
    .map(([cuisineId, { total, count }]) => ({
      cuisineId,
      cuisineName: cuisineMap.get(cuisineId)?.name || 'Unknown',
      averagePreference: total / count
    }))
    .sort((a, b) => b.averagePreference - a.averagePreference)
    .slice(0, 5); // Top 5 cuisines
  
  return {
    totalMembers: members.length,
    commonDietaryRestrictions,
    topCuisinePreferences
  };
}