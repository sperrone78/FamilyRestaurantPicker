import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { referenceDataService, favoritesService, restaurantsService, personalRatingsService } from '../services/firestore';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantForm from '../components/RestaurantForm';
import { AdminRoute } from '../components/AdminRoute';
import { AdminInitializer } from '../components/AdminInitializer';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useRestaurantsWithUserData } from '../hooks/useRestaurantsWithUserData';
import { CreateRestaurantRequest, UpdateRestaurantRequest, RestaurantWithUserData } from '../types';

export default function RestaurantsPage() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    cuisine?: string;
    dietary?: string;
    rating?: number;
    search?: string;
    showFavoritesOnly?: boolean;
  }>({});
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantWithUserData | null>(null);

  const { 
    restaurantsWithUserData, 
    loading: restaurantsLoading, 
    error: restaurantsError,
    updateFavoriteStatus,
    updatePersonalRating,
    clearOptimisticUpdate
  } = useRestaurantsWithUserData();

  const { data: cuisines = [] } = useQuery('cuisines', referenceDataService.getCuisines);
  const { data: dietaryRestrictions = [] } = useQuery('dietaryRestrictions', referenceDataService.getDietaryRestrictions);

  // Admin mutations
  const createRestaurantMutation = useMutation(
    (data: CreateRestaurantRequest) => restaurantsService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('restaurants');
        setShowRestaurantForm(false);
      },
      onError: (error) => {
        console.error('Error creating restaurant:', error);
        alert('Failed to create restaurant. Please try again.');
      }
    }
  );

  const updateRestaurantMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateRestaurantRequest }) => 
      restaurantsService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('restaurants');
        setEditingRestaurant(null);
      },
      onError: (error) => {
        console.error('Error updating restaurant:', error);
        alert('Failed to update restaurant. Please try again.');
      }
    }
  );

  const deleteRestaurantMutation = useMutation(
    (id: string) => restaurantsService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('restaurants');
      },
      onError: (error) => {
        console.error('Error deleting restaurant:', error);
        alert('Failed to delete restaurant. Please try again.');
      }
    }
  );

  // Personal rating mutations
  const setPersonalRatingMutation = useMutation(
    ({ restaurantId, rating }: { restaurantId: string; rating: number }) => 
      personalRatingsService.setRating(user!.uid, { restaurantId, rating }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['personalRatings', user?.uid]);
      },
      onError: (error) => {
        console.error('Error setting personal rating:', error);
        alert('Failed to save rating. Please try again.');
      }
    }
  );

  const removePersonalRatingMutation = useMutation(
    (ratingId: string) => personalRatingsService.removeRating(ratingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['personalRatings', user?.uid]);
      },
      onError: (error) => {
        console.error('Error removing personal rating:', error);
        alert('Failed to remove rating. Please try again.');
      }
    }
  );

  const filteredRestaurants = restaurantsWithUserData.filter(restaurant => {
    // Favorites filter
    if (filters.showFavoritesOnly && !restaurant.isFavorite) {
      return false;
    }
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = (
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.address?.toLowerCase().includes(searchTerm) ||
        restaurant.notes?.toLowerCase().includes(searchTerm) ||
        // Search through multiple cuisines
        restaurant.cuisines?.some(cuisine => 
          cuisine.name.toLowerCase().includes(searchTerm)
        ) ||
        // Fallback to single cuisine for backward compatibility
        restaurant.cuisine?.name.toLowerCase().includes(searchTerm)
      );
      if (!matchesSearch) return false;
    }
    
    // Cuisine filter - check multiple cuisines
    if (filters.cuisine) {
      const hasMatchingCuisine = (
        // Check multiple cuisines array
        restaurant.cuisines?.some(cuisine => cuisine.id === filters.cuisine) ||
        // Fallback to single cuisine for backward compatibility
        restaurant.cuisine?.id === filters.cuisine
      );
      if (!hasMatchingCuisine) return false;
    }
    
    // Dietary restriction filter
    if (filters.dietary) {
      const hasAccommodation = restaurant.dietaryAccommodations?.some(
        acc => acc.id === filters.dietary
      );
      if (!hasAccommodation) return false;
    }
    
    // Rating filter
    if (filters.rating) {
      if (!restaurant.rating || restaurant.rating < filters.rating) return false;
    }
    
    return true;
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Admin handlers
  const handleCreateRestaurant = (data: CreateRestaurantRequest) => {
    createRestaurantMutation.mutate(data);
  };

  const handleEditRestaurant = (restaurant: RestaurantWithUserData) => {
    setEditingRestaurant(restaurant);
  };

  const handleUpdateRestaurant = (data: UpdateRestaurantRequest) => {
    if (editingRestaurant) {
      updateRestaurantMutation.mutate({ id: editingRestaurant.id, data });
    }
  };

  const handleDeleteRestaurant = (id: string) => {
    deleteRestaurantMutation.mutate(id);
  };

  const handleFormCancel = () => {
    setShowRestaurantForm(false);
    setEditingRestaurant(null);
  };

  // Personal rating handlers
  const handlePersonalRatingChange = (restaurantId: string, rating: number) => {
    if (!user) return;
    
    // Optimistically update the UI
    updatePersonalRating(restaurantId, rating);
    
    // Update the database
    setPersonalRatingMutation.mutate({ restaurantId, rating });
  };

  const handlePersonalRatingRemove = (restaurantId: string) => {
    if (!user) return;
    
    const restaurant = restaurantsWithUserData.find(r => r.id === restaurantId);
    const personalRating = restaurant?.personalRating;
    
    if (personalRating) {
      // Optimistically update the UI
      updatePersonalRating(restaurantId, null);
      
      // Update the database
      removePersonalRatingMutation.mutate(personalRating.id);
    }
  };

  const handleFavoriteToggle = async (restaurantId: string, isFavorite: boolean) => {
    if (!user) return;
    
    // Optimistically update the UI
    updateFavoriteStatus(restaurantId, isFavorite);
    
    try {
      // Update the database
      if (isFavorite) {
        await favoritesService.addFavorite(user.uid, restaurantId);
      } else {
        await favoritesService.removeFavorite(user.uid, restaurantId);
      }
      
      // Invalidate the favorites query to ensure fresh data
      queryClient.invalidateQueries(['favorites', user.uid]);
      
      // Clear the optimistic update once the real data is refreshed
      setTimeout(() => clearOptimisticUpdate(restaurantId), 100);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert the optimistic update on error
      updateFavoriteStatus(restaurantId, !isFavorite);
    }
  };

  if (restaurantsError) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Restaurants</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Failed to load restaurants. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
          <AdminRoute>
            <button
              onClick={() => setShowRestaurantForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Restaurant
            </button>
          </AdminRoute>
        </div>
        <p className="text-gray-600">
          Discover restaurants with options for every taste and dietary need.
        </p>
      </div>

      {/* Admin Initializer */}
      <AdminInitializer />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Favorites Toggle */}
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showFavoritesOnly || false}
              onChange={(e) => handleFilterChange('showFavoritesOnly', e.target.checked)}
              className="mr-2 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Show only favorites
            </span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Restaurant name, cuisine, location..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Cuisine Filter */}
          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
              Cuisine
            </label>
            <select
              id="cuisine"
              value={filters.cuisine || ''}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Cuisines</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine.id} value={cuisine.id}>
                  {cuisine.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Filter */}
          <div>
            <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Needs
            </label>
            <select
              id="dietary"
              value={filters.dietary || ''}
              onChange={(e) => handleFilterChange('dietary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Options</option>
              {dietaryRestrictions.map((restriction) => (
                <option key={restriction.id} value={restriction.id}>
                  {restriction.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating
            </label>
            <select
              id="rating"
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* Active Filters & Clear */}
        {(filters.search || filters.cuisine || filters.dietary || filters.rating || filters.showFavoritesOnly) && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.cuisine && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                  {cuisines.find(c => c.id === filters.cuisine?.toString())?.name}
                  <button
                    onClick={() => handleFilterChange('cuisine', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.dietary && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                  {dietaryRestrictions.find(d => d.id === filters.dietary?.toString())?.name}
                  <button
                    onClick={() => handleFilterChange('dietary', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.rating && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                  {filters.rating}+ Stars
                  <button
                    onClick={() => handleFilterChange('rating', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.showFavoritesOnly && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorites Only
                  <button
                    onClick={() => handleFilterChange('showFavoritesOnly', false)}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          {restaurantsLoading ? 'Loading...' : `${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Restaurants Grid */}
      {restaurantsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more results.
          </p>
          <button
            onClick={clearFilters}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant}
              onFavoriteToggle={handleFavoriteToggle}
              onEdit={isAdmin ? handleEditRestaurant : undefined}
              onDelete={isAdmin ? handleDeleteRestaurant : undefined}
              onPersonalRatingChange={handlePersonalRatingChange}
              onPersonalRatingRemove={handlePersonalRatingRemove}
            />
          ))}
        </div>
      )}

      {/* Restaurant Form Modals */}
      {showRestaurantForm && (
        <RestaurantForm
          onSubmit={handleCreateRestaurant}
          onCancel={handleFormCancel}
          isLoading={createRestaurantMutation.isLoading}
        />
      )}

      {editingRestaurant && (
        <RestaurantForm
          restaurant={editingRestaurant}
          onSubmit={handleUpdateRestaurant}
          onCancel={handleFormCancel}
          isLoading={updateRestaurantMutation.isLoading}
        />
      )}
    </div>
  );
}