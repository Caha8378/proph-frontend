import React, { useState } from 'react';
import { Search, Clock, X } from 'lucide-react';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'minimal' | 'bold' | 'glass';
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  onClose,
  variant = 'minimal',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState([
    'Duke University',
    'UNC Chapel Hill',
    'Coach Mike Johnson',
  ]);

  const quickFilters = ['D1', 'D2', 'D3', 'NAIA'];

  if (!isOpen) return null;

  // Styling variants
  const containerClass = variant === 'bold' 
    ? 'bg-proph-grey rounded-2xl border-2 border-proph-yellow/20 p-6'
    : variant === 'glass'
    ? 'bg-proph-grey/90 backdrop-blur-xl rounded-xl border border-proph-grey-text/30 p-4'
    : 'bg-proph-grey rounded-xl border border-proph-grey-text/20 p-4';

  const inputClass = variant === 'bold'
    ? 'w-full bg-proph-black text-proph-white px-4 py-4 rounded-xl border-2 border-proph-grey-text/20 focus:border-proph-yellow focus:outline-none text-base'
    : variant === 'glass'
    ? 'w-full bg-proph-black/50 backdrop-blur-sm text-proph-white px-4 py-3 rounded-lg border border-proph-grey-text/30 focus:border-proph-yellow/50 focus:outline-none text-sm'
    : 'w-full bg-proph-black text-proph-white px-4 py-2.5 rounded-lg border border-proph-grey-text/20 focus:border-proph-yellow focus:outline-none text-sm';

  const chipClass = variant === 'bold'
    ? 'px-4 py-2.5 bg-proph-grey-light text-proph-white rounded-xl border-2 border-proph-grey-text/20 hover:border-proph-yellow hover:text-proph-yellow transition-colors text-base font-bold'
    : variant === 'glass'
    ? 'px-3 py-2 bg-proph-white/10 backdrop-blur-sm text-proph-white rounded-lg border border-proph-grey-text/20 hover:bg-proph-yellow/20 hover:border-proph-yellow/40 transition-colors text-sm'
    : 'px-3 py-1.5 bg-proph-grey-light text-proph-white rounded-lg border border-proph-grey-text/20 hover:bg-proph-yellow/20 hover:border-proph-yellow transition-colors text-xs';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className={`fixed top-16 left-4 right-4 z-50 ${containerClass} animate-in slide-in-from-top duration-200`}>
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${variant === 'bold' ? 'w-5 h-5' : 'w-4 h-4'} text-proph-grey-text`} />
          <input
            type="text"
            placeholder="Search schools or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`}
            autoFocus
          />
        </div>

        {/* Quick Filters */}
        <div className={variant === 'bold' ? 'mb-6' : 'mb-4'}>
          <p className={`${variant === 'bold' ? 'text-sm' : 'text-xs'} font-bold uppercase text-proph-grey-text tracking-wide mb-2`}>
            Quick Filters
          </p>
          <div className={`flex flex-wrap gap-2`}>
            {quickFilters.map((filter) => (
              <button
                key={filter}
                className={chipClass}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div>
            <p className={`${variant === 'bold' ? 'text-sm' : 'text-xs'} font-bold uppercase text-proph-grey-text tracking-wide mb-2`}>
              Recent
            </p>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center gap-3 ${
                    variant === 'bold' ? 'px-4 py-3 rounded-xl' : 'px-3 py-2 rounded-lg'
                  } hover:bg-proph-grey-light transition-colors text-left group`}
                >
                  <Clock className={`${variant === 'bold' ? 'w-5 h-5' : 'w-4 h-4'} text-proph-grey-text group-hover:text-proph-yellow transition-colors`} />
                  <span className={`flex-1 ${variant === 'bold' ? 'text-base' : 'text-sm'} text-proph-white`}>{search}</span>
                  <X className={`${variant === 'bold' ? 'w-5 h-5' : 'w-4 h-4'} text-proph-grey-text opacity-0 group-hover:opacity-100 transition-opacity`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchQuery && (
          <div className="text-center py-6 text-proph-grey-text text-sm">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>
    </>
  );
};

