import React, { useState } from 'react';
import { WineEntry } from '../types';
import TrashIcon from './icons/TrashIcon';
import StarIcon from './icons/StarIcon';

interface WineCardProps {
  wine: WineEntry;
  onDelete: (id: number) => void;
  onEdit: (wine: WineEntry) => void;
}

const WineCard: React.FC<WineCardProps> = ({ wine, onDelete, onEdit }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const noteSnippet = wine.notes.length > 60 ? `${wine.notes.substring(0, 60)}...` : wine.notes;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete(wine.id);
    setIsConfirmingDelete(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
        onClick={() => onEdit(wine)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onEdit(wine)}
        aria-label={`Edit details for ${wine.name}`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <img className="h-32 w-24 object-cover" src={wine.imageUrl} alt={`Bottle of ${wine.name}`} referrerPolicy="no-referrer" />
          </div>
          <div className="relative p-4 flex-grow">
            <div className="flex justify-between items-start">
              <div className="pr-4 flex-grow">
                <div className="uppercase tracking-wide text-xs text-red-800 font-semibold">{wine.varietal}</div>
                <p className="block text-base leading-tight font-bold text-black">{wine.name}</p>
                <p className="text-xs text-gray-500">{wine.vintage > 0 ? wine.vintage : 'N/V'} &bull; {wine.country}</p>
                {wine.price && wine.price > 0 && (
                  <p className="text-sm font-semibold text-gray-800 mt-1">{formatPrice(wine.price)}</p>
                )}
                {wine.publicRating && wine.publicRating > 0 && (
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <StarIcon className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="font-semibold">{wine.publicRating.toFixed(1)}</span>
                    <span className="ml-1">
                      ({new Intl.NumberFormat().format(wine.reviewCount || 0)} on {wine.ratingSource})
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 pl-4 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-gray-500 -mb-1 uppercase font-semibold">Rating</p>
                <div>
                  <span className="text-3xl font-bold text-red-800 tracking-tight">{wine.rating}</span>
                  <span className="text-sm text-gray-500 font-semibold">/10</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-gray-600 text-xs italic pr-12">"{noteSnippet}"</p>
            <button
              onClick={handleDeleteClick}
              className="absolute bottom-4 right-4 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors z-10"
              aria-label={`Delete ${wine.name}`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isConfirmingDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
          onClick={handleCancelDelete}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-800">Confirm Deletion</h3>
            <p className="mt-4 text-gray-600">Are you sure you want to delete "{wine.name}"? This action cannot be undone.</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WineCard;