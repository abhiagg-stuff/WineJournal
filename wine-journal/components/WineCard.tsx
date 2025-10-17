import React, { useState } from 'react';
import { WineEntry } from '../types';
import TrashIcon from './icons/TrashIcon';
import StarIcon from './icons/StarIcon';

interface WineCardProps {
  wine: WineEntry;
  onDelete: (id: string) => void;
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

  const [imgSrc, setImgSrc] = useState(wine.imageUrl || 'https://i.postimg.cc/xdvXnqyP/Wine-bottle.jpg');

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; 
    // Only fallback to default image if the current image is not a base64 string
    if (!imgSrc.startsWith('data:')) {
      setImgSrc('https://i.postimg.cc/xdvXnqyP/Wine-bottle.jpg');
    }
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 ease-in-out cursor-pointer"
        onClick={() => onEdit(wine)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onEdit(wine)}
        aria-label={`Edit details for ${wine.name}`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <img
              className="h-24 w-16 object-cover"
              src={imgSrc}
              alt={`Bottle of ${wine.name}`}
              onError={handleImgError}
            />
          </div>
          <div className="relative p-3 flex-grow">
            <div className="flex justify-between items-start">
              <div className="pr-3 flex-grow">
                <div className="flex items-center gap-2">
                  <div className="uppercase tracking-wide text-xs text-red-800 font-semibold">{wine.varietal}</div>
                  {wine.wineType && (
                    <div className="text-xs text-gray-500 capitalize">• {wine.wineType}</div>
                  )}
                </div>
                <div>
                  <p className="block text-sm leading-tight font-bold text-black">{wine.name}</p>
                </div>
                <div className="flex items-center text-xs text-gray-500 space-x-2">
                  <span>{wine.vintage > 0 ? wine.vintage : 'N/V'}</span>
                  <span>&bull;</span>
                  <span>{wine.country}</span>
                  {wine.price > 0 && (
                    <><span>&bull;</span><span className="font-bold text-black">{formatPrice(wine.price)}</span></>
                  )}
                </div>
                {wine.publicRating && wine.publicRating > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <StarIcon className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="font-medium">{wine.publicRating.toFixed(1)}</span>
                    <span className="ml-1 text-xs">
                      ({new Intl.NumberFormat().format(wine.reviewCount || 0)} on {wine.ratingSource})
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 pl-4 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-gray-500 -mb-1 uppercase font-semibold">My Rating</p>
                <div className="flex items-center mt-1 gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isHalfStar = star - 0.5 === Math.floor(wine.rating * 2) / 2;
                    const isFilled = star <= wine.rating;
                    
                    return (
                      <div key={star} className="relative w-5 h-5">
                        {/* Background star (empty) */}
                        <StarIcon 
                          className="absolute inset-0 w-5 h-5 text-gray-300"
                          aria-label={`${star} star${star === 1 ? '' : 's'}`}
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
                            className="w-5 h-5 fill-current text-red-800"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {wine.inCellar && (
                  <div className="mt-1">
                    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      In Cellar
                    </span>
                  </div>
                )}
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