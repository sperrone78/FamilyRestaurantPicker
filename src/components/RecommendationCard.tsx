import { useState } from 'react';
import { RestaurantRecommendation, RestaurantComment, PersonalRating } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { favoritesService } from '../services/firestore';
import { StarRating } from './StarRating';

interface RecommendationCardProps {
  recommendation: RestaurantRecommendation;
  totalMembers: number;
  isFavorite?: boolean;
  userComments?: RestaurantComment[];
  personalRating?: PersonalRating;
  onFavoriteToggle?: (restaurantId: string, isFavorite: boolean) => void;
}

export default function RecommendationCard({ 
  recommendation, 
  totalMembers, 
  isFavorite = false, 
  userComments = [], 
  personalRating,
  onFavoriteToggle 
}: RecommendationCardProps) {
  const { restaurant, percentage, reasons, accommodatedMembers, missedRestrictions } = recommendation;
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  const handleFavoriteToggle = async () => {
    if (!user) return;
    
    setIsTogglingFavorite(true);
    try {
      const newFavoriteState = !isFavorite;
      
      if (newFavoriteState) {
        await favoritesService.addFavorite(user.uid, restaurant.id);
      } else {
        await favoritesService.removeFavorite(user.uid, restaurant.id);
      }
      
      onFavoriteToggle?.(restaurant.id, newFavoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Determine which rating to display
  const displayRating = personalRating?.rating ?? restaurant.rating ?? 0;
  const isPersonalRating = !!personalRating;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 relative ${
      isFavorite ? 'border-2 border-red-200' : 'border border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-semibold text-gray-900">{restaurant.name}</h3>
            <div className="flex items-center space-x-2">
              {/* Favorite Button */}
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
              
              {/* Comments Indicator */}
              {userComments.length > 0 && (
                <div 
                  className="relative"
                  onMouseEnter={() => setShowComments(true)}
                  onMouseLeave={() => setShowComments(false)}
                >
                  <button className="p-2 rounded-full text-blue-500 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.965 8.965 0 01-4.126-1.004L3 21l1.996-5.874A8.965 8.965 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                  </button>
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {userComments.length}
                  </span>
                  
                  {/* Comments Tooltip */}
                  {showComments && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Your Comments</h4>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {userComments.map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <p className="text-gray-700">{comment.content}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {/* Display multiple cuisine tags */}
            {restaurant.cuisines && restaurant.cuisines.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {restaurant.cuisines.map((cuisine, index) => (
                  <span
                    key={cuisine.id || `cuisine-${index}`}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                  >
                    {cuisine.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Fallback for backward compatibility */}
            {!restaurant.cuisines && restaurant.cuisine && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {restaurant.cuisine.name}
              </span>
            )}
            {restaurant.priceRange && (
              <span className="font-medium">
                {'$'.repeat(restaurant.priceRange)}
              </span>
            )}
            {displayRating > 0 && (
              <div className="flex items-center space-x-1">
                <StarRating
                  rating={displayRating}
                  isPersonal={isPersonalRating}
                  isEditable={false}
                  size="sm"
                />
                <span className="text-sm text-gray-600">({displayRating})</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(percentage)}`}>
          {percentage}%
        </div>
      </div>

      {restaurant.address && (
        <p className="text-sm text-gray-600 mb-3">{restaurant.address}</p>
      )}

      {reasons.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Why this recommendation:</h4>
          <div className="flex flex-wrap gap-1">
            {reasons.map((reason, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">
              {accommodatedMembers.length}/{totalMembers} members
            </span>
          </div>
          
          {missedRestrictions.length > 0 && missedRestrictions.some(r => r.name && r.name.trim()) && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-600">
                Missing: {missedRestrictions.filter(r => r.name && r.name.trim()).map(r => r.name).join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {restaurant.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Website
            </a>
          )}
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
}