import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { SearchBar } from '../components/common/SearchBar';
import { PlayerAccordion } from '../components/common/PlayerAccordion';
import { PlayerProfileModal } from '../components/player/PlayerProfileModal';
import { useSearchParams } from 'react-router-dom';
import { PostingCardHorizontalMini } from '../components/posting/PostingCardHorizontalMini';
import { ApplyModalMinC } from '../components/application/ApplyModalMinC';
import type { Posting, PlayerProfile } from '../types';
import { mockPostings, mockPlayer } from '../data/mockData';

export const PlayerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<PlayerProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [appliedPostings, setAppliedPostings] = useState<Set<string>>(new Set());

  // Mock data for player carousel - create multiple players for demo
  const mockPlayers: PlayerProfile[] = [
    mockPlayer,
    {
      ...mockPlayer,
      id: 'player-2',
      name: 'Alex Thompson',
      position: 'Shooting Guard',
      photo: '/IMG_1918.jpeg',
      school: 'Denver East High',
      height: "6'3\"",
      classYear: 2025,
      location: 'Denver, CO',
      stats: {
        ppg: 19.2,
        rpg: 5.1,
        apg: 3.8,
        fgPercentage: 0.442,
        threePtPercentage: 0.365,
        steals: 1.8,
        blocks: 0.6
      }
    },
    {
      ...mockPlayer,
      id: 'player-3',
      name: 'Jordan Williams',
      position: 'Small Forward',
      photo: '/IMG_1918.jpeg',
      school: 'Cherry Creek High',
      height: "6'5\"",
      classYear: 2025,
      location: 'Aurora, CO',
      stats: {
        ppg: 16.8,
        rpg: 7.2,
        apg: 2.9,
        fgPercentage: 0.468,
        threePtPercentage: 0.312,
        steals: 2.1,
        blocks: 1.2
      }
    }
  ];

  // Get recommended postings (first 2)
  const recommendedPostings = mockPostings.slice(0, 2);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // TODO: Implement search functionality
  };

  const handleApply = (postingId: string) => {
    const posting = mockPostings.find((p) => p.id === postingId);
    if (posting) {
      setSelectedPosting(posting);
    }
  };

  const handleSubmitApplication = async (message?: string) => {
    if (selectedPosting) {
      // TODO: Call API to submit application
      console.log('Submitting application:', {
        postingId: selectedPosting.id,
        message,
      });

      setAppliedPostings((prev) => new Set(prev).add(selectedPosting.id));

      // Show success toast
      // TODO: Implement toast notification
    }
  };

  // Open from ?player= query param
  useEffect(() => {
    const playerId = searchParams.get('player');
    if (playerId && !isProfileOpen) {
      const p = mockPlayers.find(mp => mp.id === playerId);
      if (p) {
        setSelectedPlayerProfile(p);
        setIsProfileOpen(true);
      }
    }
  }, [searchParams, isProfileOpen]);

  const handleViewMorePostings = () => {
    navigate('/postings');
  };

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />

      <main className="container mx-auto px-4 pt-2 pb-4 space-y-2">
        {/* Hero Section */}
        <div className="text-center space-y-4">
        </div>

        {/* Search Section */}
        <div className="mb-4 flex items-center justify-center">
          <div>
            <h2 className="text-2xl font-extrabold text-proph-white">Search</h2>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mb-6">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search by name, school, position..."
          />
        </div>

        {/* Top Recruits Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div>
              <h2 className="text-2xl font-extrabold text-proph-white">Top Recruits</h2>
            </div>
          </div>
          
          <PlayerAccordion 
            players={mockPlayers}
            autoRotate={true}
            autoRotateInterval={4000}
            onPlayerClick={(p) => { setSelectedPlayerProfile(p); setIsProfileOpen(true); }}
          />
        </div>

        {/* Recommended Positions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-proph-white">Recommended Positions</h2>
              <p className="text-sm text-proph-grey-text">Positions matched to your profile</p>
            </div>
            <button 
              onClick={handleViewMorePostings}
              className="text-proph-purple hover:text-proph-purple-dark font-semibold text-sm transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {recommendedPostings.map((posting) => (
              <PostingCardHorizontalMini
                key={posting.id}
                posting={posting}
                onApply={handleApply}
                hasApplied={appliedPostings.has(posting.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {selectedPosting && (
        <ApplyModalMinC
          open={!!selectedPosting}
          onClose={() => setSelectedPosting(null)}
          posting={selectedPosting}
          onSuccess={handleSubmitApplication}
        />
      )}

      {/* Player Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayerProfile}
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setSelectedPlayerProfile(null);
          const params = new URLSearchParams(searchParams);
          params.delete('player');
          setSearchParams(params);
        }}
      />

      <BottomNav
        profilePhoto={mockPlayer.photo}
        hasApplicationUpdate={false}
        hasProfileUpdate={false}
      />
    </div>
  );
};
