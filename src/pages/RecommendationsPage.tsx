import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { familyMembersService, referenceDataService, restaurantsService, favoritesService, commentsService, personalRatingsService } from '../services/firestore';
import { RecommendationService } from '../services/recommendationService';
import { FamilyMember, Cuisine, RecommendationResponse, Restaurant, RestaurantFavorite, RestaurantComment } from '../types';
import MemberSelectionCard from '../components/MemberSelectionCard';
import FilterPanel from '../components/FilterPanel';
import RestaurantCard from '../components/RestaurantCard';
import SummaryPanel from '../components/SummaryPanel';
import { useAuth } from '../contexts/AuthContext';

export default function RecommendationsPage() {
  const { user, currentFamily } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<RestaurantFavorite[]>([]);
  const [comments, setComments] = useState<RestaurantComment[]>([]);
  const [filters, setFilters] = useState<{
    maxPriceRange?: number;
    minRating?: number;
    cuisineIds?: string[];
  }>({});
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([]);

  // Use React Query for personal ratings to ensure fresh data
  const { data: personalRatings = [] } = useQuery(
    ['personalRatings', user?.uid],
    () => user?.uid ? personalRatingsService.getUserRatings(user.uid) : Promise.resolve([]),
    {
      enabled: !!user?.uid,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.uid || !currentFamily) return;
      
      try {
        const [membersData, cuisinesData, restrictionsData, restaurantsData, favoritesData, commentsData] = await Promise.all([
          familyMembersService.getAll(currentFamily.id),
          referenceDataService.getCuisines(),
          referenceDataService.getDietaryRestrictions(),
          restaurantsService.getAll(),
          favoritesService.getUserFavorites(user.uid),
          commentsService.getUserComments(user.uid)
        ]);
        setFamilyMembers(membersData);
        setCuisines(cuisinesData);
        setDietaryRestrictions(restrictionsData);
        setRestaurants(restaurantsData);
        setFavorites(favoritesData);
        setComments(commentsData);
      } catch (err) {
        setError('Failed to load initial data');
        console.error('Error loading initial data:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [user?.uid, currentFamily]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMemberIds(familyMembers.map(member => member.id));
  };

  const handleClearAll = () => {
    setSelectedMemberIds([]);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleFavoriteToggle = async (restaurantId: string, isFavorite: boolean) => {
    if (!user?.uid) return;
    
    try {
      if (isFavorite) {
        // Add to favorites
        const newFavorite = await favoritesService.addFavorite(user.uid, restaurantId);
        setFavorites(prev => [...prev, newFavorite]);
      } else {
        // Remove from favorites
        await favoritesService.removeFavorite(user.uid, restaurantId);
        setFavorites(prev => prev.filter(f => f.restaurantId !== restaurantId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isRestaurantFavorite = (restaurantId: string) => {
    return favorites.some(f => f.restaurantId === restaurantId);
  };

  const getRestaurantComments = (restaurantId: string) => {
    return comments.filter(c => c.restaurantId === restaurantId);
  };

  const getPersonalRating = (restaurantId: string) => {
    return personalRatings.find(r => r.restaurantId === restaurantId);
  };

  const handleGetRecommendations = async () => {
    if (selectedMemberIds.length === 0) {
      setError('Please select at least one family member');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Convert numeric cuisine IDs to strings for the service
      const serviceFilters = filters.cuisineIds ? {
        ...filters,
        cuisineIds: filters.cuisineIds.map(id => id.toString())
      } : filters;
      
      // Use the new RecommendationService instead of the old API
      const response = RecommendationService.generateRecommendations(
        restaurants,
        familyMembers,
        selectedMemberIds,
        serviceFilters as any
      );
      
      // Apply favorite boost (10% bump for favorited restaurants, capped at 100%)
      const boostRecommendations = (recs: any[]) => {
        return recs.map(rec => {
          const isFavorite = isRestaurantFavorite(rec.restaurant.id);
          if (isFavorite) {
            const boostedPercentage = Math.min(100, rec.percentage + 10);
            return {
              ...rec,
              percentage: boostedPercentage,
              score: (boostedPercentage / 100) * rec.maxPossible
            };
          }
          return rec;
        }).sort((a, b) => b.percentage - a.percentage); // Re-sort by new percentages
      };
      
      // Apply boosts to the main response
      const boostedResponse = {
        ...response,
        recommendations: boostRecommendations(response.recommendations)
      };
      
      // If no recommendations found, try with relaxed filters
      if (boostedResponse.recommendations.length === 0 && Object.keys(filters).length > 0) {
        console.log('No matches found with filters, trying without filters...');
        
        const fallbackResponse = RecommendationService.generateRecommendations(
          restaurants,
          familyMembers,
          selectedMemberIds,
          {} // No filters
        );
        
        if (fallbackResponse.recommendations.length > 0) {
          // Apply favorite boost to fallback recommendations too
          const boostedFallbackResponse = {
            ...fallbackResponse,
            recommendations: boostRecommendations(fallbackResponse.recommendations),
            fallbackMode: 'all_filters_removed' as const,
            originalFilters: filters as any
          };
          setRecommendations(boostedFallbackResponse);
        } else {
          setRecommendations(boostedResponse);
        }
      } else {
        setRecommendations(boostedResponse);
      }
      
      // Auto-scroll to recommendations after a short delay
      setTimeout(() => {
        recommendationsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error getting recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMembers = familyMembers.filter(member => 
    selectedMemberIds.includes(member.id)
  );

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Restaurant</h1>
        <p className="text-gray-600">
          Select family members and get personalized restaurant recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Selection and Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Family Member Selection */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Select Family Members</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {familyMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No family members found. Please add family members first.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyMembers.map((member) => (
                  <MemberSelectionCard
                    key={member.id}
                    member={member}
                    isSelected={selectedMemberIds.includes(member.id)}
                    onToggle={handleMemberToggle}
                    cuisines={cuisines}
                    dietaryRestrictions={dietaryRestrictions}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <FilterPanel
            cuisines={cuisines}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Get Recommendations Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGetRecommendations}
              disabled={selectedMemberIds.length === 0 || loading}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform ${
                selectedMemberIds.length === 0 || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed scale-100'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Finding Perfect Restaurants...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Find Perfect Restaurants</span>
                </div>
              )}
            </button>
          </div>

          {/* Helpful hint */}
          {selectedMemberIds.length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-2">
              Select at least one family member to get recommendations
            </p>
          )}
          
          {selectedMemberIds.length > 0 && !recommendations && (
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Ready to find restaurants for {selectedMemberIds.length} member{selectedMemberIds.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <SummaryPanel
            selectedMembers={selectedMembers}
            summary={recommendations?.summary}
            resultsCount={recommendations?.recommendations.length}
            cuisines={cuisines}
            dietaryRestrictions={dietaryRestrictions}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Recommendations Results */}
      {recommendations && recommendations.recommendations.length > 0 && (
        <div ref={recommendationsRef} className="mt-8">
          {/* Success or Fallback Banner */}
          {recommendations.fallbackMode ? (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-orange-800 font-medium">
                    No perfect matches found - showing alternative recommendations
                  </p>
                  {recommendations.fallbackMode === 'filters_removed' && (
                    <p className="text-orange-700 text-sm mt-1">
                      Removed price/rating filters to find {recommendations.recommendations.length} restaurant{recommendations.recommendations.length !== 1 ? 's' : ''}.
                      {recommendations.originalFilters?.maxPriceRange && ` Original max price: ${'$'.repeat(recommendations.originalFilters.maxPriceRange)}`}
                      {recommendations.originalFilters?.minRating && ` Original min rating: ${recommendations.originalFilters.minRating}★`}
                    </p>
                  )}
                  {recommendations.fallbackMode === 'all_filters_removed' && (
                    <p className="text-orange-700 text-sm mt-1">
                      Removed all filters to find {recommendations.recommendations.length} restaurant{recommendations.recommendations.length !== 1 ? 's' : ''}.
                      Try adjusting your filter preferences.
                    </p>
                  )}
                  {recommendations.fallbackMode === 'member_removed' && (
                    <p className="text-orange-700 text-sm mt-1">
                      Temporarily excluded <strong>{recommendations.removedMember?.name}</strong> (most dietary restrictions) 
                      to find {recommendations.recommendations.length} restaurant{recommendations.recommendations.length !== 1 ? 's' : ''} for the remaining members.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-green-800 font-medium">
                    Found {recommendations.recommendations.length} perfect match{recommendations.recommendations.length !== 1 ? 'es' : ''} for your group!
                  </p>
                  <p className="text-green-700 text-sm">
                    Restaurants accommodate all dietary restrictions and match your preferences.
                  </p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">
              {recommendations.recommendations.length}
            </span>
            Recommended Restaurants
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.recommendations.map((recommendation, index) => (
              <div key={recommendation.restaurant.id} className="relative">
                {/* Ranking Badge */}
                {index < 3 && (
                  <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-orange-400'
                  }`}>
                    {index + 1}
                  </div>
                )}
                <RestaurantCard
                  restaurant={{
                    ...recommendation.restaurant,
                    isFavorite: isRestaurantFavorite(recommendation.restaurant.id),
                    personalRating: getPersonalRating(recommendation.restaurant.id)
                  }}
                  userComments={getRestaurantComments(recommendation.restaurant.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  recommendationData={{
                    percentage: recommendation.percentage,
                    reasons: recommendation.reasons,
                    accommodatedMembers: recommendation.accommodatedMembers,
                    missedRestrictions: recommendation.missedRestrictions
                  }}
                  totalMembers={selectedMembers.length}
                  showRecommendationInfo={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {recommendations && recommendations.recommendations.length === 0 && (
        <div ref={recommendationsRef} className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium">No restaurants found</p>
              <p className="text-yellow-700 text-sm mt-1">
                No restaurants can accommodate all the dietary restrictions of your selected family members.
              </p>
            </div>
          </div>
          
          {/* Debugging Information */}
          <div className="mt-4 p-4 bg-white rounded border border-yellow-200">
            <h4 className="font-medium text-gray-900 mb-3">🔍 Why no results?</h4>
            
            {/* Selected Members and Their Restrictions */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected members and their restrictions:</p>
              <div className="space-y-2">
                {selectedMembers.map((member) => (
                  <div key={member.id} className="text-sm">
                    <span className="font-medium text-gray-900">{member.name}:</span>
                    {member.dietaryRestrictions && member.dietaryRestrictions.length > 0 ? (
                      <div className="ml-2 mt-1">
                        {member.dietaryRestrictions.map((restriction) => (
                          <span
                            key={restriction.id}
                            className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full mr-1 mb-1"
                          >
                            {restriction.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 ml-2">No dietary restrictions</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Combined Requirements */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Restaurants must accommodate ALL of these restrictions:
              </p>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const allRestrictions = selectedMembers
                    .flatMap(member => member.dietaryRestrictions || [])
                    .filter((restriction, index, self) => 
                      self.findIndex(r => r.id === restriction.id) === index
                    );
                  
                  return allRestrictions.length > 0 ? (
                    allRestrictions.map((restriction) => (
                      <span
                        key={restriction.id}
                        className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full font-medium"
                      >
                        {restriction.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm italic">No dietary restrictions to accommodate</span>
                  );
                })()}
              </div>
            </div>

            {/* Applied Filters */}
            {(filters.maxPriceRange || filters.minRating || (filters.cuisineIds && filters.cuisineIds.length > 0)) && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {filters.maxPriceRange && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Max Price: {'$'.repeat(filters.maxPriceRange)}
                    </span>
                  )}
                  {filters.minRating && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Min Rating: {filters.minRating}★
                    </span>
                  )}
                  {filters.cuisineIds && filters.cuisineIds.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Cuisine Filter: {filters.cuisineIds.length} selected
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p className="font-medium">💡 Suggestions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Try removing some family members temporarily to see which restriction is problematic</li>
                <li>Check if restaurants in the database accommodate all the required restrictions</li>
                <li>Clear any active filters to see if they're too restrictive</li>
                <li>Add more restaurants to the database that can handle these dietary needs</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}