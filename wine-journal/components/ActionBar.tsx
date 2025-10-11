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
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search my journal..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-shadow"
            />
          </div>
          <button
            onClick={onAddClick}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-red-800 text-white rounded-lg shadow-md hover:bg-red-900 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800"
            aria-label="Add new wine"
          >
            <PlusIcon className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
