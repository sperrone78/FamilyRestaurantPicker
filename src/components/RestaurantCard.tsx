import { useState } from 'react';
import { RestaurantWithUserData, RestaurantComment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import RestaurantDetailsModal from './RestaurantDetailsModal';
import { StarRating } from './StarRating';

interface RestaurantCardProps {
  restaurant: RestaurantWithUserData;
  userComments?: RestaurantComment[];
  onFavoriteToggle?: (restaurantId: string, isFavorite: boolean) => Promise<void>;
  onEdit?: (restaurant: RestaurantWithUserData) => void;
  onDelete?: (restaurantId: string) => void;
  onPersonalRatingChange?: (restaurantId: string, rating: number) => void;
  onPersonalRatingRemove?: (restaurantId: string) => void;
}

export default function RestaurantCard({ 
  restaurant, 
  userComments = [],
  onFavoriteToggle, 
  onEdit, 
  onDelete, 
  onPersonalRatingChange, 
  onPersonalRatingRemove 
}: RestaurantCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user, currentFamily } = useAuth();
  const { isAdmin } = useAdmin();
  
  const isFavorite = restaurant.isFavorite || false;
  const formatPriceRange = (priceRange?: number) => {
    if (!priceRange) return 'N/A';
    return '$'.repeat(priceRange);
  };

  const handlePersonalRatingChange = (rating: number) => {
    if (onPersonalRatingChange) {
      onPersonalRatingChange(restaurant.id, rating);
    }
  };

  const handlePersonalRatingRemove = () => {
    if (onPersonalRatingRemove) {
      onPersonalRatingRemove(restaurant.id);
    }
  };

  // Determine which rating to display
  const displayRating = restaurant.personalRating?.rating ?? restaurant.rating ?? 0;
  const isPersonalRating = !!restaurant.personalRating;

  const handleFavoriteToggle = async () => {
    if (!user || !currentFamily || !onFavoriteToggle) return;
    
    setIsTogglingFavorite(true);
    try {
      const newFavoriteState = !isFavorite;
      await onFavoriteToggle(restaurant.id, newFavoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {restaurant.name}
              </h3>
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
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
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
            {/* Display multiple cuisine tags */}
            {restaurant.cuisines && restaurant.cuisines.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {restaurant.cuisines.map((cuisine, index) => (
                  <span
                    key={cuisine.id || `cuisine-${index}`}
                    className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                  >
                    {cuisine.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Fallback for backward compatibility */}
            {!restaurant.cuisines && restaurant.cuisine && (
              <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {restaurant.cuisine.name}
              </span>
            )}
          </div>
          <div className="text-right ml-4">
            <div className="mb-1 flex justify-end">
              {user ? (
                <div className="relative">
                  <StarRating
                    rating={displayRating}
                    isPersonal={isPersonalRating}
                    isEditable={true}
                    onRatingChange={handlePersonalRatingChange}
                    onRemoveRating={isPersonalRating ? handlePersonalRatingRemove : undefined}
                    size="md"
                  />
                </div>
              ) : displayRating > 0 ? (
                <StarRating
                  rating={displayRating}
                  isPersonal={isPersonalRating}
                  isEditable={false}
                  size="md"
                />
              ) : (
                <div className="text-gray-400 text-sm">No rating</div>
              )}
            </div>
            {restaurant.priceRange && (
              <div className="text-green-600 font-semibold">
                {formatPriceRange(restaurant.priceRange)}
              </div>
            )}
          </div>
        </div>

        {restaurant.address && (
          <div className="flex items-center text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">{restaurant.address}</span>
          </div>
        )}

        {restaurant.phone && (
          <div className="flex items-center text-gray-600 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm">{restaurant.phone}</span>
          </div>
        )}

        {restaurant.notes && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {restaurant.notes}
          </p>
        )}

        {restaurant.dietaryAccommodations && restaurant.dietaryAccommodations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Dietary Accommodations:</h4>
            <div className="flex flex-wrap gap-1">
              {restaurant.dietaryAccommodations.map((accommodation, index) => (
                <span
                  key={accommodation.id || `accommodation-${index}`}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                  title={accommodation.notes || undefined}
                >
                  {accommodation.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            {restaurant.website ? (
              <a
                href={restaurant.website}
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
          
          {/* Admin Controls */}
          {isAdmin && (onEdit || onDelete) && (
            <div className="flex justify-end space-x-2 mt-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(restaurant)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${restaurant.name}"?`)) {
                      onDelete(restaurant.id);
                    }
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <RestaurantDetailsModal
        restaurant={restaurant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}