import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Redirect component for /p/:playerId URLs
 * Redirects to home page with ?player= query parameter
 * LandingPage2 will then open the PlayerProfileModal automatically
 */
export const PlayerProfileRedirect: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (playerId) {
      // Redirect to home with player query parameter
      navigate(`/?player=${playerId}`, { replace: true });
    } else {
      // If no playerId, just go to home
      navigate('/', { replace: true });
    }
  }, [playerId, navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-proph-black flex items-center justify-center">
      <p className="text-proph-white">Loading...</p>
    </div>
  );
};

