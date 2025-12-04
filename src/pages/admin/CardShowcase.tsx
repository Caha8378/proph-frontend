import React, { useState, useEffect, useRef } from 'react';
import { PlayerCardFinal1 } from '../../components/player/PlayerCardFinal1';
import { usePlayer } from '../../hooks/usePlayer';
import * as searchService from '../../api/search';
import { Search, RotateCw, Loader2 } from 'lucide-react';

const BACKGROUND_OPTIONS = [
  { name: 'Black', value: 'bg-proph-black' },
  { name: 'Gradient 1', value: 'bg-gradient-to-br from-proph-black via-proph-grey to-proph-black' },
  { name: 'Gradient 2', value: 'bg-gradient-to-br from-proph-black via-proph-yellow/20 to-proph-black' },
  { name: 'Gradient 3', value: 'bg-gradient-to-tr from-proph-grey via-proph-black to-proph-yellow/10' },
  { name: 'Gradient 4', value: 'bg-gradient-to-bl from-proph-black via-proph-yellow/5 to-proph-grey' },
];

export const CardShowcase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'id'>('name');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [background, setBackground] = useState('bg-proph-black'); // Default to black
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const { player, loading, error } = usePlayer(playerId);


  // Auto-flip animation on load
  useEffect(() => {
    if (player && !loading) {
      // Reset flip state
      setIsFlipped(false);
      
      // Small delay to ensure card is rendered
      const startDelay = setTimeout(() => {
        // Trigger auto-flip sequence (3 flips = 6 state changes)
        const flipTimes = 3;
        let currentFlip = 0;
        
        const flipInterval = setInterval(() => {
          currentFlip++;
          setIsFlipped(prev => !prev);
          
          if (currentFlip >= flipTimes * 2) {
            clearInterval(flipInterval);
            setIsFlipped(false); // End on front
          }
        }, 2000); // Flip every 2 seconds (to match slower animation)

        return () => clearInterval(flipInterval);
      }, 500);

      return () => {
        clearTimeout(startDelay);
      };
    }
  }, [player, loading]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      if (searchType === 'id') {
        // Search by user ID
        setPlayerId(searchQuery.trim());
      } else {
        // Search by name using public search API
        const searchResults = await searchService.search(searchQuery.trim());
        if (searchResults.players && searchResults.players.length > 0) {
          // Use the first result's user_id
          const foundPlayer = searchResults.players[0];
          const id = foundPlayer.user_id || foundPlayer.id;
          if (id) {
            setPlayerId(String(id));
          } else {
            alert('Player found but missing user ID');
          }
        } else {
          alert('No players found with that name');
        }
      }
    } catch (err: any) {
      console.error('Search error:', err);
      alert(err.message || 'Failed to search for player');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  return (
    <div className={`min-h-screen ${background} transition-colors duration-300 flex flex-col items-center justify-center p-8`}>
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center gap-4 z-10">
        {/* Search */}
        <div className="flex items-center gap-2 bg-proph-grey/90 backdrop-blur-sm rounded-lg p-2 border border-proph-grey-text/20">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'name' | 'id')}
            className="bg-proph-black border border-proph-grey-light rounded px-2 py-1 text-proph-white text-sm"
          >
            <option value="name">Name</option>
            <option value="id">User ID</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={searchType === 'name' ? 'Search by name...' : 'Enter user ID...'}
            className="bg-proph-black border border-proph-grey-light rounded px-3 py-1 text-proph-white text-sm min-w-[200px] focus:outline-none focus:border-proph-yellow"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-proph-yellow text-proph-black px-3 py-1 rounded font-semibold text-sm hover:bg-[#E6D436] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Background Selector */}
        <div className="flex items-center gap-2 bg-proph-grey/90 backdrop-blur-sm rounded-lg p-2 border border-proph-grey-text/20">
          <span className="text-proph-white text-sm font-semibold">Background:</span>
          <div className="flex gap-1">
            {BACKGROUND_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setBackground(option.value)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  background === option.value
                    ? 'bg-proph-yellow text-proph-black'
                    : 'bg-proph-black text-proph-white hover:bg-proph-grey-light'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          className="bg-proph-yellow text-proph-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#E6D436] transition-colors flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          Flip Card
        </button>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-proph-yellow animate-spin mx-auto mb-4" />
            <p className="text-proph-white">Loading player...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-proph-error mb-4">{error}</p>
            <p className="text-proph-grey-text text-sm">Search for a player by name or user ID</p>
          </div>
        ) : player ? (
          <div 
            ref={cardContainerRef}
            onClick={handleFlip}
            style={{ cursor: 'pointer' }}
          >
            <PlayerCardFinal1 
              player={player} 
              flippable={true}
              controlledFlip={isFlipped}
              spinning={true}
            />
          </div>
        ) : (
          <div className="text-center">
            <p className="text-proph-grey-text mb-4">No player loaded</p>
            <p className="text-proph-grey-text text-sm">Search for a player by name or user ID to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

