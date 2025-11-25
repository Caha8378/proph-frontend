import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { SearchBar } from '../../components/common/SearchBar';
import { PlayerAccordion } from '../../components/common/PlayerAccordion';
import { PlayerProfileModal } from '../../components/player/PlayerProfileModal';
import { useSearchParams } from 'react-router-dom';
import { PostingCardHorizontalMini } from '../../components/posting/PostingCardHorizontalMini';
import { ApplyModalMinC } from '../../components/application/ApplyModalMinC';
import { useRandomPlayers, useRecommendedPostings, useProfile } from '../../hooks';
import type { Posting, PlayerProfile } from '../../types';

export const PlayerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<PlayerProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch player profile on mount to ensure profile photo is available in BottomNav
  // Note: Redirect to onboarding is now handled by ProtectedRoute based on account_status
  useProfile();

  // Fetch random players for accordion
  const { players: mockPlayers, loading: playersLoading } = useRandomPlayers(5);

  // Fetch recommended postings (top 2 best matches)
  // Note: Will return empty array if profile doesn't exist (404 handled gracefully)
  const { postings: recommendedPostings, loading: postingsLoading, refetch: refetchPostings } = useRecommendedPostings(2);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // TODO: Implement search functionality
  };

  const handleApply = (postingId: string) => {
    const posting = recommendedPostings.find((p) => String(p.id) === postingId);
    if (posting) {
      setSelectedPosting(posting);
    }
  };

  const handleApplicationSuccess = async () => {
    // Refresh postings to update has_applied status
    await refetchPostings();
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

  const handleViewMorePostings = () => {
    navigate('/player/postings');
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
          />
        </div>

        {/* Recommended Positions Section */}
        <div className="space-y-4">
          <div className="max-w-[600px] mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-proph-white">Recommended Positions</h2>
              <p className="text-sm text-proph-grey-text">Positions matched to your profile</p>
            </div>
            <button 
              onClick={handleViewMorePostings}
              className="text-proph-purple hover:text-proph-purple-dark font-semibold text-sm transition-colors"
            >
              View All Postings →
            </button>
          </div>

          <div className="space-y-3">
            {postingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-proph-grey-text">Loading recommendations...</p>
              </div>
            ) : recommendedPostings.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-proph-grey-text">No recommended postings available</p>
              </div>
            ) : (
              recommendedPostings.map((posting) => (
                <PostingCardHorizontalMini
                  key={posting.id}
                  posting={posting}
                  onApply={handleApply}
                />
              ))
            )}
          </div>
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

      {/* Apply Modal */}
      {selectedPosting && (
        <ApplyModalMinC
          open={!!selectedPosting}
          onClose={() => setSelectedPosting(null)}
          posting={selectedPosting}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Player Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayerProfile}
        playerId={selectedPlayerProfile?.id ? String(selectedPlayerProfile.id) : undefined}
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
        hasApplicationUpdate={false}
        hasProfileUpdate={false}
      />
    </div>
  );
};
