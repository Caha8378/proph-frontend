import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { PlayerCardFinal1 } from '../components/player/PlayerCardFinal1';
import apiClient, { publicApiClient } from '../api/client';
import { convertBackendPlayerToFrontend } from '../api/players';
import type { PlayerProfile } from '../types';
import { useAuth } from '../context/authContext';
import { useNotification } from '../context/notificationContext';

export const PlayerProfileSharePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in
  const isLoggedIn = !!user;

  // Helper function to format player name with proper apostrophe
  const formatPlayerNameForTitle = (name: string): string => {
    const trimmedName = name.trim();
    const lastChar = trimmedName.slice(-1).toLowerCase();
    // If name ends with 's', use apostrophe only; otherwise use apostrophe + s
    return lastChar === 's' ? `${trimmedName}' Proph` : `${trimmedName}'s Proph`;
  };

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
      // Update page title with proper apostrophe handling
      document.title = formatPlayerNameForTitle(player.name);
      
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
        : `${window.location.origin}/prophLogo.webp`;
      updateMetaTag('og:image', imageUrl);
      
      updateNameMetaTag('description', `${player.name} - Class of ${player.classYear} ${player.position || 'Basketball Player'} on Proph`);
    }
  }, [player]);

  const getHomePath = () => {
    if (isLoggedIn && user) {
      // Redirect to their home page based on role
      if (user.role === 'player') {
        return '/player/home';
      } else if (user.role === 'coach') {
        return '/coach/home';
      } else if (user.role === 'supporter' || user.role === 'fan') {
        return '/supporter/home';
      }
    }
    return '/';
  };

  const handleShare = async () => {
    if (!player) return;
    
    const url = `${window.location.origin}/p/${player.id}`;
    const shareData = {
      title: `${player.name}'s Profile`,
      text: `Check out ${player.name}'s basketball profile`,
      url: url,
    };
    
    // Helper function to copy to clipboard and show notification
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(url);
        showNotification('Profile link copied to clipboard!', 'success');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        showNotification('Failed to copy link. Please try again.', 'error');
      }
    };
    
    // Try native share API first (mobile/desktop with share support)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return; // Successfully shared via native API
      } catch (err: any) {
        // User cancelled or error occurred - fall through to clipboard
        if (err.name === 'AbortError') {
          // User cancelled - copy to clipboard automatically
          await copyToClipboard();
          return;
        } else {
          // Other error, fall back to clipboard
          console.error('Error sharing:', err);
          await copyToClipboard();
          return;
        }
      }
    }
    
    // Fallback to clipboard (if native share not available)
    await copyToClipboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-proph-black">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-proph-black border-b border-proph-grey-text/20">
          <div className="h-14 md:h-16 px-4 flex items-center justify-between relative">
            <Link 
              to="/" 
              className="active:scale-95 transition-transform"
              aria-label="Go to home"
            >
              <h1 
                className="text-xl md:text-3xl font-extrabold text-proph-yellow"
                style={{ 
                  textShadow: '0 0 10px rgba(255, 236, 60, 0.5)',
                  letterSpacing: '-2px'
                }}
              >
                Proph
              </h1>
            </Link>
            {/* Centered Home link */}
            <Link
              to={getHomePath()}
              className="absolute left-1/2 -translate-x-1/2 text-proph-white hover:text-proph-yellow transition-colors"
            >
              Home
            </Link>
            {/* Right side - Share icon */}
            <button
              onClick={handleShare}
              className="p-2 hover:bg-proph-grey-light rounded-lg transition-colors"
              aria-label="Share profile"
            >
              <Share2 className="w-5 h-5 text-proph-white" />
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
      <div className="min-h-screen bg-proph-black">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-proph-black border-b border-proph-grey-text/20">
          <div className="h-14 md:h-16 px-4 flex items-center justify-between relative">
            <Link 
              to="/" 
              className="active:scale-95 transition-transform"
              aria-label="Go to home"
            >
              <h1 
                className="text-xl md:text-3xl font-extrabold text-proph-yellow"
                style={{ 
                  textShadow: '0 0 10px rgba(255, 236, 60, 0.5)',
                  letterSpacing: '-2px'
                }}
              >
                Proph
              </h1>
            </Link>
            {/* Centered Home link */}
            <Link
              to={getHomePath()}
              className="absolute left-1/2 -translate-x-1/2 text-proph-white hover:text-proph-yellow transition-colors"
            >
              Home
            </Link>
            {/* Right side - empty space for alignment */}
            <div className="w-10"></div>
          </div>
        </header>

        {/* Error state */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-xl text-proph-white mb-4">{error || 'Player not found'}</p>
          <Link
            to={getHomePath()}
            className="flex items-center gap-2 px-6 py-3 bg-proph-yellow text-proph-black font-bold rounded-lg hover:bg-proph-yellow/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-proph-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-proph-black border-b border-proph-grey-text/20">
        <div className="h-14 md:h-16 px-4 flex items-center justify-between relative">
          <Link 
            to="/" 
            className="active:scale-95 transition-transform"
            aria-label="Go to home"
          >
            <h1 
              className="text-xl md:text-3xl font-extrabold text-proph-yellow"
              style={{ 
                textShadow: '0 0 10px rgba(255, 236, 60, 0.5)',
                letterSpacing: '-2px'
              }}
            >
              Proph
            </h1>
          </Link>
          {/* Centered Home link */}
          <Link
            to={getHomePath()}
            className="absolute left-1/2 -translate-x-1/2 text-proph-white hover:text-proph-yellow transition-colors"
          >
            Home
          </Link>
          {/* Right side - Share icon */}
          <button
            onClick={handleShare}
            className="p-2 hover:bg-proph-grey-light rounded-lg transition-colors"
            aria-label="Share profile"
          >
            <Share2 className="w-5 h-5 text-proph-white" />
          </button>
        </div>
      </header>

      {/* Main content - Player Profile Card */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page title for SEO */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-proph-white mb-2">
            {formatPlayerNameForTitle(player.name)}
          </h1>
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

