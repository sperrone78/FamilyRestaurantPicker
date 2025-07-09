import { useState } from 'react';
import { RestaurantRecommendation, RestaurantWithUserData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { favoritesService } from '../services/firestore';
import { useQueryClient } from 'react-query';
import RestaurantDetailsModal from './RestaurantDetailsModal';

interface RecommendationCardWithFavoritesProps {
  recommendation: RestaurantRecommendation;
  isFavorite?: boolean;
  onFavoriteToggle?: (restaurantId: string, isFavorite: boolean) => void;
}

export default function RecommendationCardWithFavorites({ 
  recommendation, 
  isFavorite = false,
  onFavoriteToggle 
}: RecommendationCardWithFavoritesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleFavoriteToggle = async () => {
    if (!user) return;
    
    setIsTogglingFavorite(true);
    try {
      const newFavoriteState = !isFavorite;
      
      if (newFavoriteState) {
        await favoritesService.addFavorite(user.uid, recommendation.restaurant.id);
      } else {
        await favoritesService.removeFavorite(user.uid, recommendation.restaurant.id);
      }
      
      // Invalidate the favorites query to ensure fresh data
      queryClient.invalidateQueries(['favorites', user.uid]);
      onFavoriteToggle?.(recommendation.restaurant.id, newFavoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const formatPriceRange = (priceRange?: number) => {
    if (!priceRange) return 'N/A';
    return '$'.repeat(priceRange);
  };

  const formatRating = (rating?: number) => {
    if (!rating) return 'N/A';
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '');
  };

  // Convert recommendation to RestaurantWithUserData for the modal
  const restaurantWithUserData: RestaurantWithUserData = {
    ...recommendation.restaurant,
    isFavorite
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {recommendation.restaurant.name}
              </h3>
              <button
                onClick={handleFavoriteToggle}
                disabled={isTogglingFavorite}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                } ${isTogglingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            {recommendation.restaurant.cuisine && (
              <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {recommendation.restaurant.cuisine.name}
              </span>
            )}
          </div>
          <div className="text-right ml-4">
            {recommendation.restaurant.rating && (
              <div className="text-yellow-500 text-lg mb-1" title={`${recommendation.restaurant.rating}/5 stars`}>
                {formatRating(recommendation.restaurant.rating)}
              </div>
            )}
            {recommendation.restaurant.priceRange && (
              <div className="text-green-600 font-semibold">
                {formatPriceRange(recommendation.restaurant.priceRange)}
              </div>
            )}
          </div>
        </div>

        {/* Score and percentage */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Match Score</span>
            <div className="flex items-center">
              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${recommendation.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {recommendation.percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Reasons */}
        {recommendation.reasons && recommendation.reasons.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Why this restaurant:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {recommendation.reasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Address */}
        {recommendation.restaurant.address && (
          <div className="flex items-center text-gray-600 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">{recommendation.restaurant.address}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          {recommendation.restaurant.website ? (
            <a
              href={recommendation.restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              Visit Website
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <div></div>
          )}
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            View Details
          </button>
        </div>
      </div>

      <RestaurantDetailsModal
        restaurant={restaurantWithUserData}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}