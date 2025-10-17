import React, { useState, useRef, useEffect } from 'react';
import { FilterOptions, WineType } from '../types';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wineTypes: WineType[] = ['red', 'white', 'rosé', 'sparkling', 'dessert', 'unknown'];
  const [selectedTypes, setSelectedTypes] = useState<WineType[]>(
    filters.wineType !== 'all' ? [filters.wineType as WineType] : [...wineTypes]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWineTypeClick = (type: WineType) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    onFilterChange({
      ...filters,
      wineType: newSelectedTypes.length === 0 ? 'none' : 
                newSelectedTypes.length === 1 ? newSelectedTypes[0] : 'all'
    });
  };

  const handleCellarClick = () => {
    onFilterChange({
      ...filters,
      inCellar: filters.inCellar === true ? 'all' : true
    });
  };

  const getTypeButtonLabel = () => {
    if (selectedTypes.length === 0) return 'Type';
    if (selectedTypes.length === 1) return selectedTypes[0].charAt(0).toUpperCase() + selectedTypes[0].slice(1);
    if (selectedTypes.length === wineTypes.length) return 'All Types';
    return `${selectedTypes.length} Types`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filter Chips */}
      <div className="flex gap-2 items-center flex-wrap">
        {/* Wine Type Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className={`h-8 px-3 rounded-full text-sm transition-colors flex items-center gap-1
              ${selectedTypes.length > 0
                ? 'bg-red-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {getTypeButtonLabel()}
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showTypeDropdown && (
            <div className="absolute z-10 mt-2 py-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
              {wineTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleWineTypeClick(type)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                >
                  <div className={`w-4 h-4 mr-2 rounded border ${
                    selectedTypes.includes(type) ? 'bg-red-800 border-red-800' : 'border-gray-300'
                  }`}>
                    {selectedTypes.includes(type) && (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* In Cellar Chip */}
        <button
          onClick={handleCellarClick}
          className={`h-8 px-3 rounded-full text-sm transition-colors ${
            filters.inCellar === true
              ? 'bg-red-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In Cellar
        </button>

        {/* Clear Filters - Only show if any filter is active */}
        {(selectedTypes.length > 0 || filters.inCellar !== 'all') && (
          <button
            onClick={() => {
              setSelectedTypes([]);
              onFilterChange({ wineType: 'all', inCellar: 'all' });
            }}
            className="h-8 px-3 text-sm text-red-800 hover:text-red-900 hover:bg-red-50 rounded-full flex items-center gap-1 transition-colors"
          >
            <XIcon className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;
