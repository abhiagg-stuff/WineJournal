
import React, { useState } from 'react';
import { User } from 'firebase/auth';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';

interface HeaderProps {
  user: User | null;
  rightContent?: React.ReactNode;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, rightContent, searchTerm, onSearchChange }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  // Get first name from display name or email
  const getFirstName = (user: User) => {
    if (user.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const displayName = user ? getFirstName(user) : null;

  return (
    <>
      <div className="bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          {displayName && (
            <p className="text-sm font-medium text-gray-600">Welcome, {displayName}</p>
          )}
          {rightContent}
        </div>
      </div>
      <div className="sticky top-0 bg-gray-50 z-40">
        <div className="h-px bg-gray-200 mt-2 mb-3 w-24"></div>
        <div className="flex items-center pb-2">
          {isSearchVisible ? (
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search wines..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-shadow"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchVisible(false)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Close search"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-medium text-black tracking-tight">My Wines</h1>
              <button 
                onClick={() => setIsSearchVisible(true)}
                className="p-1.5 text-gray-500 hover:text-red-800 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search wines"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
