import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { CoachBottomNav } from '../../components/layout/CoachBottomNav';
import { SearchBar } from '../../components/common/SearchBar';
import { PlayerAccordion } from '../../components/common/PlayerAccordion';
import { CreatePostingModal } from '../../components/posting/CreatePostingModal';
import { PendingVerificationBanner } from '../../components/coach/PendingVerificationBanner';
import { ClipboardList, Plus, Lock } from 'lucide-react';
import { PlayerProfileModal } from '../../components/player/PlayerProfileModal';
import { useRandomPlayers, useProfile, useApplicationInfo } from '../../hooks';
import { useAuth } from '../../context/authContext';
import type { PlayerProfile } from '../../types';
import { useSearchParams } from 'react-router-dom';

export const CoachHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  
  // Fetch coach profile
  const { profileNotFound } = useProfile();
  
  // Use user.emailVerified as the source of truth for verification status
  // Handle both boolean and number (1/0) from backend
  const isVerified = !!user?.emailVerified;

  // Redirect to onboarding if profile doesn't exist
  useEffect(() => {
    if (profileNotFound) {
      navigate('/onboarding/coach', { replace: true });
    }
  }, [profileNotFound, navigate]);

  // Fetch application info (pending count)
  const { pendingCount } = useApplicationInfo();

  // Fetch random players for accordion
  const { players, loading: playersLoading } = useRandomPlayers(5);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handlePlayerClick = (player: PlayerProfile) => {
    setSelectedPlayer(player);
    setIsProfileModalOpen(true);
  };

  // Open modal from ?player= query param
  useEffect(() => {
    const playerId = searchParams.get('player');
    if (playerId && !isProfileModalOpen && players.length > 0) {
      const found = players.find(p => p.id === playerId);
      if (found) {
        setSelectedPlayer(found);
        setIsProfileModalOpen(true);
      } else {
        // If player not in list, fetch by ID
        setSelectedPlayer(null);
        setIsProfileModalOpen(true);
      }
    }
  }, [searchParams, isProfileModalOpen, players]);

  const handleClosePlayerModal = () => {
    setIsProfileModalOpen(false);
    setSelectedPlayer(null);
    const params = new URLSearchParams(searchParams);
    params.delete('player');
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />

      <main className="container mx-auto px-4 pt-2 pb-4 space-y-6">
        {/* Pending Verification Banner */}
        {!isVerified && <PendingVerificationBanner />}

        {/* Search Section Header */}
        <div className="mb-4 flex items-center justify-center">
          <div>
            <h2 className="text-2xl font-extrabold text-proph-white">Search</h2>
          </div>
        </div>
        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={(q) => console.log('coach search:', q)} />
        </div>

        {/* Grow Your Program */}
        <section>
          <div className="mb-6 flex items-center justify-center">
            <div>
              <h2 className="text-2xl font-extrabold text-proph-white">Grow Your Program</h2>
            </div>
          </div>
          <div className="max-w-[800px] mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Create New Posting */}
              <button
                aria-label="Create a new recruitment posting"
                onClick={() => {
                  if (!isVerified) {
                    alert('Your account is pending verification. You\'ll be able to create postings once approved.');
                    return;
                  }
                  window.location.href = '/coach/postings?create=1';
                }}
                disabled={!isVerified}
                className={`bg-proph-yellow text-proph-black rounded-xl mx-6 sm:mx-0 p-6 sm:p-8 min-h-[140px] sm:min-h-[160px] shadow-lg transition-all text-left ${
                  isVerified
                    ? 'hover:bg-[#E6D436]'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  {!isVerified && <Lock className="w-10 h-10 text-proph-black" />}
                  <Plus className="w-10 h-10 text-proph-black" />
                </div>
                <h3 className="text-xl font-bold text-proph-black">Create New Posting</h3>
                <p className="text-base text-proph-black/80 mt-1">
                  {isVerified ? 'Find your next recruit' : 'Verify your account to create postings'}
                </p>
              </button>

              {/* Review Applications */}
              <button
                aria-label="Review applications"
                onClick={() => {
                  if (!isVerified) {
                    alert('Your account is pending verification. You\'ll be able to review applications once approved.');
                    return;
                  }
                  window.location.href = '/coach/applications';
                }}
                disabled={!isVerified}
                className={`bg-proph-grey rounded-xl mx-6 sm:mx-0 p-6 sm:p-8 min-h-[140px] sm:min-h-[160px] shadow-lg transition-all text-left ${
                  isVerified
                    ? 'hover:bg-proph-grey-light'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  {!isVerified && <Lock className="w-10 h-10 text-proph-yellow" />}
                  <ClipboardList className="w-10 h-10 text-proph-yellow" />
                </div>
                <h3 className="text-xl font-bold text-proph-yellow">Review Applications</h3>
                <p className="text-base text-proph-white/80 mt-1">
                  {isVerified
                    ? pendingCount > 0 
                      ? `${pendingCount} pending ${pendingCount === 1 ? 'application' : 'applications'}`
                      : 'Manage player applications'
                    : 'Verify your account to review applications'
                  }
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* Discover Recruits */}
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-proph-white mb-1 text-center">Discover Recruits</h2>
          <div className="max-w-2xl mx-auto my-2 px-6 overflow-visible">
            {playersLoading ? (
              <div className="flex items-center justify-center h-[650px]">
                <p className="text-proph-grey-text">Loading players...</p>
              </div>
            ) : (
              <PlayerAccordion players={players} onPlayerClick={handlePlayerClick} />
            )}
          </div>
        </section>
      </main>

      <CreatePostingModal open={createOpen} onClose={() => setCreateOpen(false)} onPublish={() => setCreateOpen(false)} />

      <CoachBottomNav pendingAppsCount={pendingCount} isVerified={isVerified} />

      <PlayerProfileModal
        player={selectedPlayer}
        playerId={searchParams.get('player') || selectedPlayer?.id}
        isOpen={isProfileModalOpen}
        onClose={handleClosePlayerModal}
      />
    </div>
  );
};


