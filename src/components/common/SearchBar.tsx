import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { search } from '../../api/search';
import { SearchResultsDropdown } from './SearchResultsDropdown';
import { PlayerProfileModal } from '../player/PlayerProfileModal';
import type { SearchResponse } from '../../api/search';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  onPlayerClick?: (playerId: string | number) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Find colleges or recruits",
  className = "",
  onPlayerClick,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse>({ players: [], coachingStaffs: [] });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | number | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults({ players: [], coachingStaffs: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ players: [], coachingStaffs: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      setShowDropdown(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300); // 300ms debounce
    } else {
      setResults({ players: [], coachingStaffs: [] });
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
    setShowDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handlePlayerClick = (playerId: string | number) => {
    if (onPlayerClick) {
      onPlayerClick(playerId);
    } else {
      setSelectedPlayerId(playerId);
      setIsPlayerModalOpen(true);
    }
    setShowDropdown(false);
    setQuery('');
  };

  const handleClosePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setSelectedPlayerId(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={`w-full ${className}`}>
        <div ref={containerRef} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-proph-grey-text" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (query.length >= 2) {
                setShowDropdown(true);
              }
            }}
            placeholder={placeholder}
            className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-xl pl-12 pr-4 py-4 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-purple/40 focus:ring-2 focus:ring-proph-purple/20 transition-all duration-200"
          />
          {showDropdown && (
            <SearchResultsDropdown
              query={query}
              results={results}
              loading={loading}
              onPlayerClick={handlePlayerClick}
              onClose={() => setShowDropdown(false)}
            />
          )}
        </div>
      </form>

      {/* Player Profile Modal */}
      {selectedPlayerId && (
        <PlayerProfileModal
          playerId={String(selectedPlayerId)}
          isOpen={isPlayerModalOpen}
          onClose={handleClosePlayerModal}
        />
      )}
    </>
  );
};
