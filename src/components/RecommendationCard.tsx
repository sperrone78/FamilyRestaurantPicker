import { RestaurantRecommendation } from '../types';

interface RecommendationCardProps {
  recommendation: RestaurantRecommendation;
  totalMembers: number;
}

export default function RecommendationCard({ recommendation, totalMembers }: RecommendationCardProps) {
  const { restaurant, score, reasons, accommodatedMembers, missedRestrictions } = recommendation;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
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
          <svg key={i} className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
            <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{restaurant.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {restaurant.cuisine && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {restaurant.cuisine.name}
              </span>
            )}
            {restaurant.priceRange && (
              <span className="font-medium">
                {'$'.repeat(restaurant.priceRange)}
              </span>
            )}
            {restaurant.rating && (
              <div className="flex items-center space-x-1">
                <div className="flex">{renderStars(restaurant.rating)}</div>
                <span className="text-sm text-gray-600">({restaurant.rating})</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(score)}`}>
          {score}/100
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
          
          {missedRestrictions.length > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-600">
                Missing: {missedRestrictions.map(r => r.name).join(', ')}
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