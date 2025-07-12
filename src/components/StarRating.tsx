import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  isPersonal?: boolean;
  isEditable?: boolean;
  onRatingChange?: (rating: number) => void;
  onRemoveRating?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  isPersonal = false,
  isEditable = false,
  onRatingChange,
  onRemoveRating,
  size = 'md'
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starClass = sizeClasses[size];
  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  const handleStarClick = (starRating: number) => {
    if (isEditable && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (isEditable) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (isEditable) {
      setHoveredRating(null);
    }
  };

  const renderStar = (position: number) => {
    const isFilled = position <= displayRating;
    const isHalf = position - 0.5 <= displayRating && position > displayRating;
    
    return (
      <button
        key={position}
        type="button"
        disabled={!isEditable}
        onClick={() => handleStarClick(position)}
        onMouseEnter={() => handleStarHover(position)}
        className={`${starClass} ${isEditable ? 'cursor-pointer' : 'cursor-default'} ${
          isPersonal ? 'personal-star' : ''
        } transition-all duration-200 ${
          isEditable ? 'hover:scale-110' : ''
        } p-1 -m-1 rounded`}
        style={{ minWidth: '24px', minHeight: '24px' }}
        title={isEditable ? `Rate ${position} star${position !== 1 ? 's' : ''}` : `${rating} star${rating !== 1 ? 's' : ''}`}
      >
        <svg
          fill={isFilled ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          className={`w-full h-full pointer-events-none ${
            isPersonal 
              ? isFilled 
                ? 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' 
                : 'text-pink-300'
              : isFilled 
                ? 'text-yellow-500' 
                : 'text-gray-300'
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isFilled ? 0 : 2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
          {isHalf && (
            <defs>
              <linearGradient id={`half-${position}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          )}
        </svg>
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(position => renderStar(position))}
      </div>
      
      {isPersonal && isEditable && onRemoveRating && (
        <button
          type="button"
          onClick={onRemoveRating}
          className="ml-2 text-pink-400 hover:text-pink-600 text-sm"
          title="Remove personal rating"
        >
          ×
        </button>
      )}
      
      {isPersonal && (
        <span className="ml-1 text-xs text-pink-600 font-medium">Personal</span>
      )}
    </div>
  );
};