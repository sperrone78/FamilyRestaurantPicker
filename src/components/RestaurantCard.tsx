import { useState } from 'react';
import { Restaurant } from '../types';
import RestaurantDetailsModal from './RestaurantDetailsModal';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formatPriceRange = (priceRange?: number) => {
    if (!priceRange) return 'N/A';
    return '$'.repeat(priceRange);
  };

  const formatRating = (rating?: number) => {
    if (!rating) return 'N/A';
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {restaurant.name}
            </h3>
            {restaurant.cuisine && (
              <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {restaurant.cuisine.name}
              </span>
            )}
          </div>
          <div className="text-right">
            {restaurant.rating && (
              <div className="text-yellow-500 text-lg mb-1" title={`${restaurant.rating}/5 stars`}>
                {formatRating(restaurant.rating)}
              </div>
            )}
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
              {restaurant.dietaryAccommodations.map((accommodation) => (
                <span
                  key={accommodation.id}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                  title={accommodation.notes || undefined}
                >
                  {accommodation.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
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
      </div>

      <RestaurantDetailsModal
        restaurant={restaurant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}