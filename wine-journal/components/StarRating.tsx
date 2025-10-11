import React from 'react';
import StarIcon from './icons/StarIcon';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={index}
            className={`${sizeClass} ${
              starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;