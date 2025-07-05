import { useState } from 'react';
import { useQuery } from 'react-query';
import { restaurantsApi, referenceDataApi } from '../services/api';
import type { Restaurant } from '../types';
import RestaurantCard from '../components/RestaurantCard';

export default function RestaurantsPage() {
  const [filters, setFilters] = useState<{
    cuisine?: number;
    dietary?: number;
    rating?: number;
    search?: string;
  }>({});

  const { data: restaurants = [], isLoading: restaurantsLoading, error: restaurantsError } = useQuery(
    ['restaurants', filters.cuisine, filters.dietary, filters.rating],
    () => restaurantsApi.getAll({
      cuisine: filters.cuisine,
      dietary: filters.dietary,
      rating: filters.rating,
    })
  );

  const { data: cuisines = [] } = useQuery('cuisines', referenceDataApi.getCuisines);
  const { data: dietaryRestrictions = [] } = useQuery('dietaryRestrictions', referenceDataApi.getDietaryRestrictions);

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.address?.toLowerCase().includes(searchTerm) ||
      restaurant.cuisine?.name.toLowerCase().includes(searchTerm) ||
      restaurant.notes?.toLowerCase().includes(searchTerm)
    );
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurants</h1>
        <p className="text-gray-600">
          Discover restaurants with options for every taste and dietary need.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
              placeholder="Restaurant name, location..."
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
              onChange={(e) => handleFilterChange('cuisine', e.target.value ? parseInt(e.target.value) : '')}
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
              onChange={(e) => handleFilterChange('dietary', e.target.value ? parseInt(e.target.value) : '')}
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
        {(filters.search || filters.cuisine || filters.dietary || filters.rating) && (
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
                  {cuisines.find(c => c.id === filters.cuisine)?.name}
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
                  {dietaryRestrictions.find(d => d.id === filters.dietary)?.name}
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
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}