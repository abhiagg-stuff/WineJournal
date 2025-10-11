import React, { useState, FormEvent, useEffect } from 'react';
import { WineEntry, ResearchedData } from '../types';
import RatingSlider from './RatingSlider';
import XIcon from './icons/XIcon';
import LoadingSpinner from './LoadingSpinner';
import StarIcon from './icons/StarIcon';


// --- PROPS INTERFACE ---
interface AddWineModalProps {
  modalState: 'closed' | 'asking' | 'loading' | 'confirming' | 'editing';
  onClose: () => void;
  onAddWine: (wine: Omit<WineEntry, 'id' | 'dateAdded'>) => void;
  onUpdateWine: (wine: WineEntry) => void;
  onResearch: (wineName: string) => void;
  researchedData: ResearchedData;
  editingWine: WineEntry | null;
  apiError: string | null;
}

// --- SUB-COMPONENTS FOR EACH MODAL STATE ---

const AskNameView: React.FC<{
  onResearch: (name: string) => void;
  onClose: () => void;
  apiError: string | null;
}> = ({ onResearch, onClose, apiError }) => {
  const [wineName, setWineName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (wineName.trim()) {
      onResearch(wineName.trim());
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add a New Wine</h2>
      <p className="text-gray-600 mb-4">Enter the name of a wine, and we'll research the details for you.</p>
      {apiError && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4 text-sm">{apiError}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="e.g., Cloudy Bay Sauvignon Blanc"
          value={wineName}
          onChange={(e) => setWineName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
          required
          autoFocus
        />
        <div className="flex justify-end pt-6">
          <button type="button" onClick={onClose} className="mr-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800">Research Wine</button>
        </div>
      </form>
    </>
  );
};

const LoadingView: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <LoadingSpinner />
    <h2 className="text-xl font-semibold text-gray-800 mt-4">Researching...</h2>
    <p className="text-gray-600 mt-2">Finding details for your wine.</p>
  </div>
);

const DetailsView: React.FC<{
  initialData: ResearchedData | WineEntry;
  onSave: (data: Omit<WineEntry, 'id' | 'dateAdded'> | WineEntry) => void;
  onClose: () => void;
  isEditing: boolean;
}> = ({ initialData, onSave, onClose, isEditing }) => {
  // FIX: The 'rating' property only exists on 'WineEntry', not 'ResearchedData'.
  // Use a type guard to check for the property before accessing it, and provide a default.
  const [userRating, setUserRating] = useState('rating' in initialData ? initialData.rating : 5);
  const [personalNotes, setPersonalNotes] = useState(initialData.notes ?? '');

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (isEditing) {
        onSave({
          ...(initialData as WineEntry),
          rating: userRating,
          notes: personalNotes,
        });
    } else {
        onSave({
          name: initialData.name || '',
          vintage: initialData.vintage || new Date().getFullYear(),
          varietal: initialData.varietal || '',
          country: initialData.country || '',
          imageUrl: initialData.imageUrl || '',
          description: initialData.description || '',
          publicRating: initialData.publicRating || 0,
          reviewCount: initialData.reviewCount || 0,
          ratingSource: initialData.ratingSource || '',
          price: initialData.price || 0,
          rating: userRating,
          notes: personalNotes,
        });
    }
  };
  
  const title = isEditing ? 'Edit Your Wine' : 'Review Your Wine';
  const saveButtonText = isEditing ? 'Update Entry' : 'Save to Journal';

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h2>
      
      <div className="text-center">
        {initialData.imageUrl && 
          <img src={initialData.imageUrl} alt={`Bottle of ${initialData.name}`} className="w-24 h-36 object-cover mx-auto mb-4 rounded-md shadow-lg" referrerPolicy="no-referrer" />
        }
        <h3 className="text-xl font-bold text-gray-800">{initialData.name}</h3>
        <p className="text-sm text-gray-500">{initialData.vintage > 0 ? initialData.vintage : 'N/V'} &bull; {initialData.country}</p>
        
        {initialData.price && initialData.price > 0 && (
            <p className="text-lg font-semibold text-gray-700 mt-2">${initialData.price.toFixed(2)}</p>
        )}

        {initialData.publicRating && initialData.publicRating > 0 && (
            <div className="flex items-center justify-center mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded-lg">
              <StarIcon className="w-4 h-4 text-yellow-500 mr-1.5" />
              <span className="font-bold">{initialData.publicRating.toFixed(1)}</span>
              <span className="mx-1">/</span>
              <span>
                {new Intl.NumberFormat().format(initialData.reviewCount || 0)} ratings on {initialData.ratingSource}
              </span>
            </div>
        )}

        <p className="mt-4 text-sm text-gray-700 text-left italic">
            "{initialData.description}"
        </p>
      </div>

      <hr className="my-6" />

      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex flex-col items-center w-full px-4">
            <label className="text-gray-800 font-semibold mb-2">Your Personal Rating</label>
            <RatingSlider rating={userRating} onRatingChange={setUserRating} />
        </div>
        
        <div>
            <label className="text-gray-800 font-semibold mb-2 block text-center">Your Notes</label>
            <textarea 
                name="notes" 
                value={personalNotes} 
                onChange={(e) => setPersonalNotes(e.target.value)} 
                placeholder="Add your personal tasting notes..." 
                rows={4} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800" 
            />
        </div>
        
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="mr-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800">{saveButtonText}</button>
        </div>
      </form>
    </>
  );
};


// --- MAIN MODAL COMPONENT ---

const AddWineModal: React.FC<AddWineModalProps> = ({ modalState, onClose, onAddWine, onUpdateWine, onResearch, researchedData, editingWine, apiError }) => {
  if (modalState === 'closed') {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close modal"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {modalState === 'asking' && <AskNameView onResearch={onResearch} onClose={onClose} apiError={apiError} />}
        {modalState === 'loading' && <LoadingView />}
        {modalState === 'confirming' && 
            <DetailsView 
                initialData={researchedData}
                onSave={onAddWine}
                onClose={onClose}
                isEditing={false}
            />
        }
        {modalState === 'editing' && editingWine &&
            <DetailsView 
                initialData={editingWine}
                onSave={onUpdateWine}
                onClose={onClose}
                isEditing={true}
            />
        }
      </div>
    </div>
  );
};

export default AddWineModal;