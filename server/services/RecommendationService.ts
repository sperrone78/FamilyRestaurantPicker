import { db } from '../database/connection';
import { 
  RecommendationRequest, 
  RecommendationResponse, 
  RestaurantRecommendation,
  RecommendationSummary,
  FamilyMember,
  Restaurant,
  DietaryRestriction
} from '../types';

export class RecommendationService {
  static async generateRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const { memberIds, filters } = request;

    const [members, restaurants] = await Promise.all([
      this.getMembersWithPreferences(memberIds),
      this.getEligibleRestaurants(filters)
    ]);

    if (members.length === 0) {
      throw new Error('No family members found with provided IDs');
    }

    const allDietaryRestrictions = this.getAllDietaryRestrictions(members);
    const filteredRestaurants = this.filterRestaurantsByDietaryRestrictions(restaurants, allDietaryRestrictions);
    
    const recommendations = this.scoreRestaurants(filteredRestaurants, members, allDietaryRestrictions);
    const summary = this.generateSummary(members, allDietaryRestrictions);

    return {
      recommendations: recommendations.sort((a, b) => b.score - a.score),
      summary
    };
  }

  private static async getMembersWithPreferences(memberIds: number[]): Promise<FamilyMember[]> {
    const placeholders = memberIds.map((_, index) => `$${index + 1}`).join(',');
    
    const query = `
      SELECT 
        fm.id,
        fm.name,
        fm.email,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN dr.id IS NOT NULL 
              THEN JSON_BUILD_OBJECT(
                'id', dr.id,
                'name', dr.name,
                'description', dr.description
              )
              ELSE NULL 
            END
          ) FILTER (WHERE dr.id IS NOT NULL), 
          '[]'
        ) as dietary_restrictions,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN c.id IS NOT NULL 
              THEN JSON_BUILD_OBJECT(
                'cuisineId', c.id,
                'cuisineName', c.name,
                'preferenceLevel', mcp.preference_level
              )
              ELSE NULL 
            END
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as cuisine_preferences
      FROM family_members fm
      LEFT JOIN member_dietary_restrictions mdr ON fm.id = mdr.member_id
      LEFT JOIN dietary_restrictions dr ON mdr.dietary_restriction_id = dr.id
      LEFT JOIN member_cuisine_preferences mcp ON fm.id = mcp.member_id
      LEFT JOIN cuisines c ON mcp.cuisine_id = c.id
      WHERE fm.id IN (${placeholders})
      GROUP BY fm.id, fm.name, fm.email
    `;

    const result = await db.query(query, memberIds);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      dietaryRestrictions: row.dietary_restrictions || [],
      cuisinePreferences: row.cuisine_preferences || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private static async getEligibleRestaurants(filters?: {
    maxPriceRange?: number;
    minRating?: number;
    cuisineIds?: number[];
  }): Promise<Restaurant[]> {
    let query = `
      SELECT 
        r.id,
        r.name,
        r.address,
        r.phone,
        r.price_range,
        r.rating,
        r.website,
        r.notes,
        r.created_at,
        JSON_BUILD_OBJECT(
          'id', c.id,
          'name', c.name,
          'description', c.description
        ) as cuisine,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN dr.id IS NOT NULL 
              THEN JSON_BUILD_OBJECT(
                'id', dr.id,
                'name', dr.name,
                'notes', rda.notes
              )
              ELSE NULL 
            END
          ) FILTER (WHERE dr.id IS NOT NULL), 
          '[]'
        ) as dietary_accommodations
      FROM restaurants r
      LEFT JOIN cuisines c ON r.cuisine_id = c.id
      LEFT JOIN restaurant_dietary_accommodations rda ON r.id = rda.restaurant_id
      LEFT JOIN dietary_restrictions dr ON rda.dietary_restriction_id = dr.id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters?.maxPriceRange) {
      conditions.push(`r.price_range <= $${paramIndex++}`);
      params.push(filters.maxPriceRange);
    }

    if (filters?.minRating) {
      conditions.push(`r.rating >= $${paramIndex++}`);
      params.push(filters.minRating);
    }

    if (filters?.cuisineIds && filters.cuisineIds.length > 0) {
      const placeholders = filters.cuisineIds.map(() => `$${paramIndex++}`).join(',');
      conditions.push(`r.cuisine_id IN (${placeholders})`);
      params.push(...filters.cuisineIds);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY r.id, r.name, r.address, r.phone, r.price_range, r.rating, r.website, r.notes, r.created_at, c.id, c.name, c.description
      ORDER BY r.rating DESC, r.name ASC
    `;

    const result = await db.query(query, params);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      cuisine: row.cuisine,
      priceRange: row.price_range,
      rating: row.rating,
      website: row.website,
      notes: row.notes,
      dietaryAccommodations: row.dietary_accommodations || [],
      createdAt: row.created_at
    }));
  }

  private static getAllDietaryRestrictions(members: FamilyMember[]): DietaryRestriction[] {
    const restrictionsMap = new Map<number, DietaryRestriction>();
    
    members.forEach(member => {
      member.dietaryRestrictions?.forEach(restriction => {
        restrictionsMap.set(restriction.id, restriction);
      });
    });

    return Array.from(restrictionsMap.values());
  }

  private static filterRestaurantsByDietaryRestrictions(
    restaurants: Restaurant[], 
    requiredRestrictions: DietaryRestriction[]
  ): Restaurant[] {
    if (requiredRestrictions.length === 0) {
      return restaurants;
    }

    return restaurants.filter(restaurant => {
      const accommodatedIds = new Set(
        restaurant.dietaryAccommodations?.map(acc => acc.id) || []
      );
      
      return requiredRestrictions.every(restriction => 
        accommodatedIds.has(restriction.id)
      );
    });
  }

  private static scoreRestaurants(
    restaurants: Restaurant[], 
    members: FamilyMember[],
    allDietaryRestrictions: DietaryRestriction[]
  ): RestaurantRecommendation[] {
    return restaurants.map(restaurant => {
      let score = 0;
      const reasons: string[] = [];
      const accommodatedMembers: number[] = [];
      const missedRestrictions: DietaryRestriction[] = [];

      const restaurantAccommodations = new Set(
        restaurant.dietaryAccommodations?.map(acc => acc.id) || []
      );

      members.forEach(member => {
        let memberAccommodated = true;
        
        member.dietaryRestrictions?.forEach(restriction => {
          if (restaurantAccommodations.has(restriction.id)) {
            accommodatedMembers.push(member.id);
          } else {
            memberAccommodated = false;
            if (!missedRestrictions.find(r => r.id === restriction.id)) {
              missedRestrictions.push(restriction);
            }
          }
        });

        if (memberAccommodated && member.dietaryRestrictions?.length === 0) {
          accommodatedMembers.push(member.id);
        }
      });

      if (allDietaryRestrictions.length > 0 && missedRestrictions.length === 0) {
        score += 40;
        reasons.push('Accommodates all dietary restrictions');
      }

      const cuisineScore = this.calculateCuisineScore(restaurant, members);
      score += cuisineScore.score;
      if (cuisineScore.reason) {
        reasons.push(cuisineScore.reason);
      }

      if (restaurant.rating && restaurant.rating >= 4.5) {
        score += 15;
        reasons.push('Excellent rating');
      } else if (restaurant.rating && restaurant.rating >= 4.0) {
        score += 10;
        reasons.push('Good rating');
      }

      if (restaurant.priceRange && restaurant.priceRange <= 2) {
        score += 5;
        reasons.push('Budget-friendly');
      }

      return {
        restaurant,
        score: Math.max(0, Math.min(100, score)),
        reasons,
        accommodatedMembers: [...new Set(accommodatedMembers)],
        missedRestrictions
      };
    });
  }

  private static calculateCuisineScore(restaurant: Restaurant, members: FamilyMember[]): { score: number; reason?: string } {
    if (!restaurant.cuisine) {
      return { score: 0 };
    }

    const preferences = members
      .flatMap(member => member.cuisinePreferences || [])
      .filter(pref => pref.cuisineId === restaurant.cuisine!.id);

    if (preferences.length === 0) {
      return { score: 0 };
    }

    const averagePreference = preferences.reduce((sum, pref) => sum + pref.preferenceLevel, 0) / preferences.length;
    const score = (averagePreference / 5) * 30;

    let reason: string | undefined;
    if (averagePreference >= 4.5) {
      reason = `High preference match for ${restaurant.cuisine.name} cuisine`;
    } else if (averagePreference >= 3.5) {
      reason = `Good preference match for ${restaurant.cuisine.name} cuisine`;
    }

    return { score, reason };
  }

  private static generateSummary(members: FamilyMember[], allDietaryRestrictions: DietaryRestriction[]): RecommendationSummary {
    const restrictionCounts = new Map<number, { restriction: DietaryRestriction; count: number }>();
    
    members.forEach(member => {
      member.dietaryRestrictions?.forEach(restriction => {
        const current = restrictionCounts.get(restriction.id);
        if (current) {
          current.count++;
        } else {
          restrictionCounts.set(restriction.id, { restriction, count: 1 });
        }
      });
    });

    const cuisinePreferenceMap = new Map<number, { cuisineName: string; total: number; count: number }>();
    
    members.forEach(member => {
      member.cuisinePreferences?.forEach(pref => {
        const current = cuisinePreferenceMap.get(pref.cuisineId);
        if (current) {
          current.total += pref.preferenceLevel;
          current.count++;
        } else {
          cuisinePreferenceMap.set(pref.cuisineId, {
            cuisineName: pref.cuisineName,
            total: pref.preferenceLevel,
            count: 1
          });
        }
      });
    });

    return {
      totalMembers: members.length,
      commonDietaryRestrictions: Array.from(restrictionCounts.values()).map(({ restriction, count }) => ({
        id: restriction.id,
        name: restriction.name,
        memberCount: count
      })),
      topCuisinePreferences: Array.from(cuisinePreferenceMap.entries())
        .map(([cuisineId, { cuisineName, total, count }]) => ({
          cuisineId,
          cuisineName,
          averagePreference: parseFloat((total / count).toFixed(1))
        }))
        .sort((a, b) => b.averagePreference - a.averagePreference)
        .slice(0, 5)
    };
  }
}