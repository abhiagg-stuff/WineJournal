import React from 'react';
import SearchIcon from './icons/SearchIcon';
import PlusIcon from './icons/PlusIcon';

interface ActionBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddClick: () => void;
  onChatClick: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ searchTerm, onSearchChange, onAddClick, onChatClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-30">
      <div className="container mx-auto max-w-4xl p-3 sm:p-4">
        <div className="flex justify-end gap-4">
          <button
            onClick={onChatClick}
            className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-white text-red-800 rounded-full shadow-md border-2 border-red-800 hover:bg-red-50 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800"
            aria-label="Get wine recommendations"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </button>
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
