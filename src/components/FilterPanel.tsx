import { useState } from 'react';
import { Cuisine } from '../types';

interface FilterPanelProps {
  cuisines: Cuisine[];
  filters: {
    maxPriceRange?: number;
    minRating?: number;
    cuisineIds?: string[];
  };
  onFiltersChange: (filters: {
    maxPriceRange?: number;
    minRating?: number;
    cuisineIds?: string[];
  }) => void;
}

export default function FilterPanel({ cuisines, filters, onFiltersChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePriceRangeChange = (value: number) => {
    onFiltersChange({ ...filters, maxPriceRange: value });
  };

  const handleRatingChange = (value: number) => {
    onFiltersChange({ ...filters, minRating: value });
  };

  const handleCuisineToggle = (cuisineId: string) => {
    const currentCuisines = filters.cuisineIds || [];
    const newCuisines = currentCuisines.includes(cuisineId)
      ? currentCuisines.filter(id => id !== cuisineId)
      : [...currentCuisines, cuisineId];
    
    onFiltersChange({ 
      ...filters, 
      cuisineIds: newCuisines.length > 0 ? newCuisines : undefined 
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.maxPriceRange || filters.minRating || (filters.cuisineIds?.length ?? 0) > 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div 
        className="p-4 cursor-pointer border-b border-gray-200 flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              Active
            </span>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price Range
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((price) => (
                <button
                  key={price}
                  onClick={() => handlePriceRangeChange(price)}
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                    filters.maxPriceRange === price
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {'$'.repeat(price)}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <div className="flex items-center space-x-2">
              {[3, 3.5, 4, 4.5, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                    filters.minRating === rating
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {rating}★
                </button>
              ))}
            </div>
          </div>

          {/* Cuisines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine Types
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {cuisines.map((cuisine) => (
                <label key={cuisine.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.cuisineIds?.includes(cuisine.id) || false}
                    onChange={() => handleCuisineToggle(cuisine.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{cuisine.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full py-2 px-4 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}