import React from 'react';

interface RatingSliderProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const RatingSlider: React.FC<RatingSliderProps> = ({ rating, onRatingChange }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-500">1</span>
        <span className="text-2xl font-bold text-red-800">{rating}</span>
        <span className="text-sm text-gray-500">10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={rating}
        onChange={(e) => onRatingChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-800"
      />
    </div>
  );
};

export default RatingSlider;
