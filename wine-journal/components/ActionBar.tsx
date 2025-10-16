import React from 'react';
import SearchIcon from './icons/SearchIcon';
import PlusIcon from './icons/PlusIcon';

interface ActionBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddClick: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ searchTerm, onSearchChange, onAddClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-30">
      <div className="container mx-auto max-w-4xl p-3 sm:p-4">
        <div className="flex justify-end">
          <button
            onClick={onAddClick}
            className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-red-800 text-white rounded-full shadow-md hover:bg-red-900 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800"
            aria-label="Add new wine"
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
