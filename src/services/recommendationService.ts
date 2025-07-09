import { FamilyMember, Restaurant, RestaurantRecommendation, RecommendationResponse } from '../types';

export class RecommendationService {
  
  static generateRecommendations(
    restaurants: Restaurant[],
    familyMembers: FamilyMember[],
    selectedMemberIds: string[],
    filters?: {
      maxPriceRange?: number;
      minRating?: number;
      cuisineIds?: string[];
    }
  ): RecommendationResponse {
    
    const selectedMembers = familyMembers.filter(member => 
      selectedMemberIds.includes(member.id)
    );

    if (selectedMembers.length === 0) {
      return {
        recommendations: [],
        summary: {
          totalMembers: 0,
          commonDietaryRestrictions: [],
          topCuisinePreferences: []
        }
      };
    }

    // Get all dietary restrictions from selected members
    const allRestrictions = selectedMembers.flatMap(member => 
      member.dietaryRestrictions || []
    );
    
    // Get common dietary restrictions
    const restrictionCounts = allRestrictions.reduce((acc, restriction) => {
      acc[restriction.id] = (acc[restriction.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonDietaryRestrictions = Object.entries(restrictionCounts).map(([id, count]) => {
      const restriction = allRestrictions.find(r => r.id === id);
      return {
        id,
        name: restriction?.name || 'Unknown',
        memberCount: count
      };
    });

    // Get cuisine preferences
    const allPreferences = selectedMembers.flatMap(member => 
      member.cuisinePreferences || []
    );
    
    const cuisinePreferenceMap = allPreferences.reduce((acc, pref) => {
      if (!acc[pref.cuisineId]) {
        acc[pref.cuisineId] = {
          cuisineId: pref.cuisineId,
          cuisineName: pref.cuisineName,
          totalScore: 0,
          count: 0
        };
      }
      acc[pref.cuisineId].totalScore += pref.preferenceLevel;
      acc[pref.cuisineId].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const topCuisinePreferences = Object.values(cuisinePreferenceMap)
      .map((pref: any) => ({
        cuisineId: pref.cuisineId,
        cuisineName: pref.cuisineName,
        averagePreference: pref.totalScore / pref.count
      }))
      .sort((a, b) => b.averagePreference - a.averagePreference);

    // Filter and score restaurants
    let filteredRestaurants = restaurants;

    // Apply filters
    if (filters?.maxPriceRange) {
      filteredRestaurants = filteredRestaurants.filter(r => 
        !r.priceRange || r.priceRange <= filters.maxPriceRange!
      );
    }

    if (filters?.minRating) {
      filteredRestaurants = filteredRestaurants.filter(r => 
        r.rating && r.rating >= filters.minRating!
      );
    }

    if (filters?.cuisineIds && filters.cuisineIds.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(r => 
        r.cuisine && filters.cuisineIds!.includes(r.cuisine.id)
      );
    }

    // Score restaurants
    const recommendations: RestaurantRecommendation[] = filteredRestaurants
      .map(restaurant => {
        const score = this.scoreRestaurant(restaurant, selectedMembers, cuisinePreferenceMap);
        return {
          restaurant,
          score: score.total,
          percentage: Math.min(Math.round((score.total / score.maxPossible) * 100), 100),
          maxPossible: score.maxPossible,
          reasons: score.reasons,
          accommodatedMembers: selectedMemberIds, // Simplified for now
          missedRestrictions: [] // Simplified for now
        };
      })
      .filter(rec => rec.score > 0) // Only show restaurants with some positive score
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit to top 20

    return {
      recommendations,
      summary: {
        totalMembers: selectedMembers.length,
        commonDietaryRestrictions,
        topCuisinePreferences: topCuisinePreferences.slice(0, 5)
      }
    };
  }

  private static scoreRestaurant(
    restaurant: Restaurant, 
    selectedMembers: FamilyMember[],
    cuisinePreferenceMap: Record<string, any>
  ) {
    let score = 0;
    let maxPossible = 0;
    const reasons: string[] = [];


    // Base score for existing restaurant
    score += 10;
    maxPossible += 10;
    reasons.push('Available restaurant option');

    // Rating score (0-20 points)
    if (restaurant.rating) {
      const ratingScore = (restaurant.rating / 5) * 20;
      score += ratingScore;
      maxPossible += 20;
      
      if (restaurant.rating >= 4.5) {
        reasons.push('Excellent rating (4.5+ stars)');
      } else if (restaurant.rating >= 4.0) {
        reasons.push('Great rating (4+ stars)');
      } else if (restaurant.rating >= 3.5) {
        reasons.push('Good rating (3.5+ stars)');
      }
    } else {
      maxPossible += 20;
    }

    // Price range score (0-10 points for budget-friendly)
    if (restaurant.priceRange) {
      if (restaurant.priceRange <= 2) {
        score += 10;
        reasons.push('Budget-friendly option');
      } else if (restaurant.priceRange === 3) {
        score += 5;
      }
      maxPossible += 10;
    } else {
      maxPossible += 10;
    }

    // Cuisine preference score (0-30 points)
    if (restaurant.cuisine && cuisinePreferenceMap[restaurant.cuisine.id]) {
      const avgPreference = cuisinePreferenceMap[restaurant.cuisine.id].totalScore / 
                           cuisinePreferenceMap[restaurant.cuisine.id].count;
      const cuisineScore = (avgPreference / 5) * 30;
      score += cuisineScore;
      
      
      if (avgPreference >= 4) {
        reasons.push(`Highly preferred ${restaurant.cuisine.name} cuisine`);
      } else if (avgPreference >= 3) {
        reasons.push(`Liked ${restaurant.cuisine.name} cuisine`);
      }
    }
    maxPossible += 30;

    // Dietary accommodations score (0-30 points)
    const allRestrictions = selectedMembers.flatMap(member => 
      member.dietaryRestrictions || []
    );
    const uniqueRestrictions = Array.from(
      new Set(allRestrictions.map(r => typeof r === 'string' ? r : r.id))
    );

    if (uniqueRestrictions.length > 0) {
      const accommodatedCount = uniqueRestrictions.filter(restrictionId => 
        restaurant.dietaryAccommodations?.some(acc => acc.id === restrictionId)
      ).length;
      
      const accommodationScore = (accommodatedCount / uniqueRestrictions.length) * 30;
      score += accommodationScore;
      
      
      if (accommodatedCount === uniqueRestrictions.length) {
        reasons.push('Accommodates all dietary restrictions');
      } else if (accommodatedCount > 0) {
        reasons.push(`Accommodates ${accommodatedCount} of ${uniqueRestrictions.length} dietary restrictions`);
      }
    }
    maxPossible += 30;


    return {
      total: Math.round(score),
      maxPossible: Math.round(maxPossible),
      reasons: reasons.slice(0, 4) // Limit to top 4 reasons
    };
  }
}