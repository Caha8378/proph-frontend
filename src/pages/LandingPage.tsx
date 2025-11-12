import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Megaphone, Check, LogIn, UserPlus } from 'lucide-react';
import { SearchBar } from '../components/common/SearchBar';
import { PlayerAccordion } from '../components/common/PlayerAccordion';
import { PlayerProfileModal } from '../components/player/PlayerProfileModal';
import { useRandomPlayers } from '../hooks';
import { useAuth } from '../context/authContext';
import type { PlayerProfile } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<'player' | 'coach'>('player');
  const playerParam = searchParams.get('player');
  
  // Redirect coaches to their home page
  useEffect(() => {
    if (user && user.role === 'coach') {
      navigate('/coach/home', { replace: true });
    }
  }, [user, navigate]);
  
  // Fetch random players for accordion
  const { players: featuredPlayers, loading: playersLoading } = useRandomPlayers(5);

  const openPlayer = (player: PlayerProfile) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('player', player.id);
      return next;
    }, { replace: false });
  };

  const closeModal = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('player');
      return next;
    }, { replace: false });
  };

  return (
    <div className="min-h-screen bg-proph-black text-proph-white">
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-[70] bg-proph-grey/95 backdrop-blur-sm border-b border-proph-grey-text/20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Logo */}
          <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
            <h1
              className="text-xl font-extrabold text-proph-yellow"
              style={{ textShadow: '0 0 10px rgba(255, 236, 60, 0.5)', letterSpacing: '-2px' }}
            >
              Proph
            </h1>
          </button>

          {/* Right: Auth links */}
          <nav className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/login')}
              className="px-3 py-2 rounded-lg hover:bg-proph-grey-light active:scale-95 transition-all flex items-center gap-1 text-sm font-semibold text-proph-white"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-3 py-2 rounded-lg bg-proph-yellow text-proph-black active:scale-95 transition-all text-sm font-bold"
            >
              <UserPlus className="w-4 h-4 inline mr-1" />
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-proph-yellow text-proph-black text-center h-[80vh] flex flex-col justify-start pt-8 md:pt-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Ball Logo with Bounce */}
          <div className="flex justify-center mb-1 animate-bounce-subtle" aria-hidden="true">
            <img
              src="/logoBall.png"
              alt="Proph ball logo"
              className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain"
            />
          </div>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar className="mb-4" />
          </div>
          
          {/* Word Logo (no bounce) */}
          <div className="flex justify-center mb-4" aria-hidden="true">
            <img
              src="/logoWord.png"
              alt="Proph word logo"
              className="w-64 h-auto md:w-80 md:h-auto lg:w-96 lg:h-auto object-contain"
            />
          </div>
          
          {/* Tagline */}
          <p className="text-2xl font-bold mt-2">The First Ever Digital Basketball Resume</p>
          
          {/* Role Selection Buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button 
              onClick={() => {
                setSelectedRole('player');
                navigate('/signup');
              }}
              className={`rounded-xl font-black px-6 py-3 active:scale-95 transition-transform ${
                selectedRole === 'player'
                  ? 'bg-proph-black text-proph-yellow'
                  : 'bg-transparent border-2 border-proph-black text-proph-black'
              }`}
            >
              I'm a Player
            </button>
            <button 
              onClick={() => {
                setSelectedRole('coach');
                navigate('/signup');
              }}
              className={`rounded-xl font-black px-6 py-3 active:scale-95 transition-transform ${
                selectedRole === 'coach'
                  ? 'bg-proph-black text-proph-yellow'
                  : 'bg-transparent border-2 border-proph-black text-proph-black'
              }`}
            >
              I'm a Coach
            </button>
          </div>
        </div>
      </section>

      {/* 3. CAROUSEL SECTION */}
      <section className="bg-proph-grey py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-3xl font-black text-center mb-8">See Proph in Action</h3>
          {playersLoading ? (
            <div className="flex items-center justify-center h-[650px]">
              <p className="text-proph-grey-text">Loading players...</p>
            </div>
          ) : (
            <PlayerAccordion 
              players={featuredPlayers}
              autoRotate
              autoRotateInterval={5000}
              onPlayerClick={(player) => openPlayer(player)}
            />
          )}
        </div>
      </section>

      {/* 4. AI DIFFERENTIATOR */}
      <section className="bg-proph-black py-20 border-y-4 border-proph-yellow">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-4xl font-black text-proph-yellow text-center">Your AI Recruiting Advantage</h3>
          <p className="text-center text-proph-grey-text font-semibold mt-2">No other platform uses AI to match players with programs</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Players */}
            <div className="bg-proph-grey rounded-2xl p-8 border-2 border-proph-yellow/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-proph-yellow flex items-center justify-center">
                  <User className="w-6 h-6 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold">For Players</h4>
              </div>
              <p className="text-sm font-semibold">Our AI analyzes your stats and projects your college level (D1, D2, D3, NAIA) plus playing style comparisons to NBA players.</p>
              <p className="mt-2 text-sm font-semibold">→ Apply to schools where you'll actually succeed, not just dream schools.</p>
            </div>

            {/* Coaches */}
            <div className="bg-proph-grey rounded-2xl p-8 border-2 border-proph-yellow/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-proph-yellow flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold">For Coaches</h4>
              </div>
              <p className="text-sm font-semibold">Every applicant is pre-qualified by our AI. No more wasting time reviewing players who aren't ready for your program's level.</p>
              <p className="mt-2 text-sm font-semibold">→ Only see players who actually fit your system and skill requirements.</p>
            </div>
          </div>

          <p className="text-center text-proph-yellow font-bold text-xl mt-6">No other recruiting platform has this technology</p>
        </div>
      </section>

      {/* 5. MARKET RESEARCH PROOF */}
      <section className="bg-proph-grey py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-3xl font-black text-center mb-8">Built for the 95%</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-proph-black rounded-2xl p-6 text-center border border-proph-grey-text/20">
              <div className="text-5xl font-black text-proph-yellow">970K</div>
              <div className="mt-1 text-sm text-proph-grey-text">High school players</div>
            </div>
            <div className="bg-proph-black rounded-2xl p-6 text-center border border-proph-grey-text/20">
              <div className="text-5xl font-black text-proph-yellow">38K</div>
              <div className="mt-1 text-sm text-proph-grey-text">College spots</div>
            </div>
            <div className="bg-proph-black rounded-2xl p-6 text-center border border-proph-grey-text/20">
              <div className="text-5xl font-black text-proph-yellow">95%</div>
              <div className="mt-1 text-sm text-proph-grey-text">Underserved by current platforms</div>
            </div>
          </div>

          <ul className="mt-6 space-y-2">
            <li className="flex items-center gap-2 text-sm font-semibold"><Check className="w-4 h-4 text-proph-yellow" /> Data-driven</li>
            <li className="flex items-center gap-2 text-sm font-semibold"><Check className="w-4 h-4 text-proph-yellow" /> Transparent</li>
            <li className="flex items-center gap-2 text-sm font-semibold"><Check className="w-4 h-4 text-proph-yellow" /> Affordable</li>
          </ul>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="bg-proph-yellow py-20 text-center text-proph-black">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-4xl font-black">Ready to Create Your Proph?</h3>
          <p className="mt-2 font-semibold">Join 1,247 players...</p>
          <button 
            onClick={() => navigate('/signup')}
            className="mt-6 rounded-xl font-black bg-proph-black text-proph-yellow px-16 py-5 active:scale-95 transition-transform"
          >
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* Modal: player param */}
      <PlayerProfileModal 
        playerId={playerParam}
        isOpen={!!playerParam} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default LandingPage;


