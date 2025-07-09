import { RestaurantWithUserData } from '../types';
import RestaurantComments from './RestaurantComments';

interface RestaurantDetailsModalProps {
  restaurant: RestaurantWithUserData;
  isOpen: boolean;
  onClose: () => void;
}

export default function RestaurantDetailsModal({ restaurant, isOpen, onClose }: RestaurantDetailsModalProps) {
  if (!isOpen) return null;

  const formatPriceRange = (priceRange?: number) => {
    if (!priceRange) return 'Not specified';
    const symbols = '$'.repeat(priceRange);
    const labels = ['', 'Budget-friendly', 'Moderate', 'Expensive', 'Very Expensive'];
    return `${symbols} (${labels[priceRange]})`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300" viewBox="0 0 20 20">
            <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
            {restaurant.cuisine && (
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mt-2">
                {restaurant.cuisine.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating and Price */}
          <div className="flex items-center justify-between">
            {restaurant.rating ? (
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(restaurant.rating)}
                </div>
                <span className="text-sm text-gray-600">({restaurant.rating}/5)</span>
              </div>
            ) : (
              <span className="text-gray-500">No rating available</span>
            )}
            
            {restaurant.priceRange && (
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  {formatPriceRange(restaurant.priceRange)}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurant.address && (
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Address</h4>
                  <p className="text-gray-600">{restaurant.address}</p>
                </div>
              </div>
            )}

            {restaurant.phone && (
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Phone</h4>
                  <a href={`tel:${restaurant.phone}`} className="text-blue-600 hover:text-blue-800">
                    {restaurant.phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Website */}
          {restaurant.website && (
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900">Website</h4>
                <a 
                  href={restaurant.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Visit Website</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {restaurant.notes && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">About This Restaurant</h4>
              <p className="text-gray-600 leading-relaxed">{restaurant.notes}</p>
            </div>
          )}

          {/* Dietary Accommodations */}
          {restaurant.dietaryAccommodations && restaurant.dietaryAccommodations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Dietary Accommodations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {restaurant.dietaryAccommodations.map((accommodation, index) => (
                  <div key={accommodation.id || `accommodation-${index}`} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h5 className="font-medium text-green-800">{accommodation.name}</h5>
                        {accommodation.notes && (
                          <p className="text-green-700 text-sm mt-1">{accommodation.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <RestaurantComments restaurantId={restaurant.id} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Added {new Date(restaurant.createdAt).toLocaleDateString()}
          </div>
          <div className="flex space-x-3">
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Call Restaurant
              </a>
            )}
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}