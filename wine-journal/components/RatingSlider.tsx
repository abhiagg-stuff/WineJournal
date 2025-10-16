import React from 'react';
import StarIcon from './icons/StarIcon';

interface RatingSliderProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const RatingSlider: React.FC<RatingSliderProps> = ({ rating, onRatingChange }) => {
  const renderStar = (position: number) => {
    const isHalfStar = position - 0.5 === rating;
    const isFilled = position <= rating;
    const starValue = Math.ceil(position);

    return (
      <button
        key={position}
        className="relative focus:outline-none transition-colors duration-200 w-8"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // If clicking on a full star that's already selected, make it a half star
          if (position === rating) {
            onRatingChange(position - 0.5);
          } else {
            onRatingChange(position);
          }
        }}
        onMouseEnter={(e) => {
          // Show the half-star state on hover
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 2) {
            e.currentTarget.setAttribute('data-half', 'true');
          } else {
            e.currentTarget.setAttribute('data-half', 'false');
          }
        }}
        aria-label={`Rate ${position} star${position === 1 ? '' : 's'}`}
      >
        {/* Star container */}
        <div className="relative w-8 h-8">
          {/* Background star (empty) */}
          <StarIcon 
            className="absolute inset-0 w-8 h-8 text-gray-300"
          />
          
          {/* Foreground star (filled) */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ 
              clipPath: isHalfStar ? 'inset(0 50% 0 0)' : undefined,
              width: isFilled || isHalfStar ? '100%' : '0%'
            }}
          >
            <StarIcon 
              className="w-8 h-8 fill-current text-amber-500"
            />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
      </div>
    </div>
  );
};

export default RatingSlider;
