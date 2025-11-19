import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { PlayerCardFinal1 } from '../components/player/PlayerCardFinal1';
import apiClient, { publicApiClient } from '../api/client';
import { convertBackendPlayerToFrontend } from '../api/players';
import type { PlayerProfile } from '../types';
import { useAuth } from '../context/authContext';

export const PlayerProfileSharePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in
  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId || isNaN(parseInt(playerId))) {
        setError('Invalid player ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Try public endpoint first (for unauthenticated users)
        // If that fails, we'll try authenticated endpoint as fallback
        let response;
        try {
          response = await publicApiClient.get(`/players/${playerId}`);
        } catch (publicError: any) {
          // If public endpoint fails (401/403), try authenticated endpoint
          // This allows logged-in users to view profiles even if public endpoint doesn't work
          const token = localStorage.getItem('authToken');
          if (token) {
            response = await apiClient.get(`/players/${playerId}`);
          } else {
            throw publicError;
          }
        }
        
        // Convert backend format to frontend format using existing conversion function
        const frontendPlayer = convertBackendPlayerToFrontend(response.data);
        setPlayer(frontendPlayer as PlayerProfile);
      } catch (err: any) {
        console.error('Error fetching player:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load player profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  // Update meta tags for social sharing
  useEffect(() => {
    if (player) {
      // Update page title
      document.title = `${player.name} - Class of ${player.classYear} | Proph`;
      
      // Update meta tags for social sharing
      const updateMetaTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };
      
      const updateNameMetaTag = (name: string, content: string) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };
      
      updateMetaTag('og:title', `${player.name} - Proph Card`);
      updateMetaTag('og:description', `${player.name} - Class of ${player.classYear} ${player.position || 'Basketball Player'}`);
      updateMetaTag('og:type', 'profile');
      updateMetaTag('og:url', `${window.location.origin}/p/${player.id}`);
      const imageUrl = player.photo && player.photo !== '/defualt.webp' 
        ? (player.photo.startsWith('http') ? player.photo : `${window.location.origin}${player.photo}`)
        : `${window.location.origin}/prophLogo.png`;
      updateMetaTag('og:image', imageUrl);
      
      updateNameMetaTag('description', `${player.name} - Class of ${player.classYear} ${player.position || 'Basketball Player'} on Proph`);
    }
  }, [player]);

  const handleHomeClick = () => {
    if (isLoggedIn && user) {
      // Redirect to their home page based on role
      if (user.role === 'player') {
        navigate('/player/home');
      } else if (user.role === 'coach') {
        navigate('/coach/home');
      } else if (user.role === 'supporter' || user.role === 'fan') {
        navigate('/supporter/home');
      } else {
        navigate('/');
      }
    } else {
      // Go to landing page
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-proph-grey">
        {/* Header */}
        <header className="bg-proph-black border-b border-proph-grey-text/20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-proph-yellow">
              Proph
            </Link>
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-4 py-2 bg-proph-grey-light rounded-lg hover:bg-proph-grey transition-colors text-proph-white"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </header>

        {/* Loading state */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-proph-yellow border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-proph-grey">
        {/* Header */}
        <header className="bg-proph-black border-b border-proph-grey-text/20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-proph-yellow">
              Proph
            </Link>
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-4 py-2 bg-proph-grey-light rounded-lg hover:bg-proph-grey transition-colors text-proph-white"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </header>

        {/* Error state */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-xl text-proph-white mb-4">{error || 'Player not found'}</p>
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2 px-6 py-3 bg-proph-yellow text-proph-black font-bold rounded-lg hover:bg-proph-yellow/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-proph-grey">
      {/* Header */}
      <header className="bg-proph-black border-b border-proph-grey-text/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-proph-yellow">
            Proph
          </Link>
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2 px-4 py-2 bg-proph-grey-light text-proph-white rounded-lg hover:bg-proph-grey transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main content - Player Profile Card */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page title for SEO */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-proph-white mb-2">
            {player.name}
          </h1>
          <p className="text-proph-grey-text">
            Class of {player.classYear} • {player.position || 'Basketball Player'}
            {player.school && ` • ${player.school}`}
          </p>
        </div>

        {/* Player Card Component */}
        <div className="flex items-center justify-center">
          <PlayerCardFinal1 player={player} flippable={true} showReviewBadge={false} />
        </div>

        {/* Call-to-action for non-logged-in users */}
        {!isLoggedIn && (
          <div className="mt-8 bg-proph-black border-2 border-proph-yellow rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-proph-white mb-3">
              Create Your Own Proph Card
            </h3>
            <p className="text-proph-grey-text mb-6">
              Get discovered by college coaches with your own AI-powered recruiting profile.
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-3 bg-proph-yellow text-proph-black font-bold rounded-lg hover:bg-proph-yellow/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

