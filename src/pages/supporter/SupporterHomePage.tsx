import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { PlayerAccordion } from '../../components/common/PlayerAccordion';
import { PlayerProfileModal } from '../../components/player/PlayerProfileModal';
import { useSearchParams } from 'react-router-dom';
import { useRandomPlayers } from '../../hooks';
import type { PlayerProfile } from '../../types';

export const SupporterHomePage: React.FC = () => {
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<PlayerProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch random players for accordion
  const { players: mockPlayers, loading: playersLoading } = useRandomPlayers(5);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // TODO: Implement search functionality
  };

  // Open from ?player= query param
  useEffect(() => {
    const playerId = searchParams.get('player');
    if (playerId && !isProfileOpen && mockPlayers.length > 0) {
      const p = mockPlayers.find(mp => mp.id === playerId);
      if (p) {
        setSelectedPlayerProfile(p);
        setIsProfileOpen(true);
      }
    }
  }, [searchParams, isProfileOpen, mockPlayers]);

  return (
    <div className="min-h-screen bg-proph-black">
      <Header />

      <main className="container mx-auto px-4 pt-2 pb-4 space-y-2">
        {/* Search Section */}
        <div className="mb-4 flex items-center justify-center">
          <div>
            <h2 className="text-2xl font-extrabold text-proph-white">Search</h2>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mb-6">
          <SearchBar 
            onSearch={handleSearch}
          />
        </div>

        {/* Top Recruits Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div>
              <h2 className="text-2xl font-extrabold text-proph-white">Top Recruits</h2>
            </div>
          </div>
          
          {playersLoading ? (
            <div className="flex items-center justify-center h-[650px]">
              <p className="text-proph-grey-text">Loading players...</p>
            </div>
          ) : (
            <PlayerAccordion 
              players={mockPlayers}
              autoRotate={true}
              autoRotateInterval={4000}
              onPlayerClick={(p) => { setSelectedPlayerProfile(p); setIsProfileOpen(true); }}
            />
          )}
        </div>
      </main>

      {/* Player Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayerProfile}
        playerId={searchParams.get('player') || selectedPlayerProfile?.id}
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setSelectedPlayerProfile(null);
          const params = new URLSearchParams(searchParams);
          params.delete('player');
          setSearchParams(params);
        }}
      />
    </div>
  );
};

