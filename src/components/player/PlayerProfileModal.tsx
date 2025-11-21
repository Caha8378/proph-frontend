import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, Share2, Users, Check, X as XIcon } from 'lucide-react';
import { PlayerCardFinal1 } from './PlayerCardFinal1';
import { usePlayer, useNotification } from '../../hooks';
import { trackEvent } from '../../api/notifications';
import type { PlayerProfile } from '../../types';
import type { Application } from '../../types';

interface PlayerProfileModalProps {
  player?: PlayerProfile | null; // Optional - can pass player directly
  playerId?: string | null; // Or pass playerId to fetch
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
  showViewTeam?: boolean;
  is_being_reviewed?: boolean; // Show Accept/Reject buttons when true
  application?: Application | null; // Application data needed for Accept/Reject modals
  onAccept?: (applicationId: string) => void; // Callback when Accept button is clicked
  onReject?: (applicationId: string) => void; // Callback when Reject button is clicked
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player: playerProp,
  playerId,
  isOpen,
  onClose,
  onShare,
  showViewTeam = false,
  is_being_reviewed = false,
  application = null,
  onAccept,
  onReject,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = React.useState(false);
  const { showNotification } = useNotification();
  
  // Fetch player data if playerId is provided (instead of player prop)
  // Only fetch if playerId is valid (not undefined/null/empty)
  const validPlayerId = playerId && playerId !== 'undefined' && playerId !== 'null' ? playerId : null;
  const { player: fetchedPlayer, loading, error } = usePlayer(validPlayerId);
  
  // Use fetched player if available, otherwise use prop
  const player = validPlayerId ? fetchedPlayer : playerProp;

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setEntered(true);
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  // Track profile modal opened event when modal opens and player is available
  useEffect(() => {
    if (isOpen && player?.id && !loading) {
      trackEvent({
        eventType: 'profile_modal_opened',
        targetUserId: player.id,
        metadata: {
          source: playerProp ? 'prop' : 'fetched',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [isOpen, player?.id, loading, playerProp]);

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
        
        // Track clipboard share
        if (player.id) {
          trackEvent({
            eventType: 'card_shared',
            targetUserId: player.id,
            metadata: {
              shareMethod: 'clipboard',
              timestamp: new Date().toISOString(),
            },
          });
        }
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        showNotification('Failed to copy link. Please try again.', 'error');
      }
    };
    
    // Try native share API first (mobile/desktop with share support)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        // Track successful native share
        if (player.id) {
          trackEvent({
            eventType: 'card_shared',
            targetUserId: player.id,
            metadata: {
              shareMethod: 'native',
              timestamp: new Date().toISOString(),
            },
          });
        }
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
    
    // Call custom onShare handler if provided
    if (onShare) {
      onShare();
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  // Loading state
  if (playerId && loading) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={handleBackdrop}
      >
        <div className="bg-proph-black rounded-2xl p-8">
          <p className="text-proph-grey-text">Loading player profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (playerId && error) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={handleBackdrop}
      >
        <div className="bg-proph-black rounded-2xl p-8">
          <p className="text-proph-error">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 text-proph-yellow hover:text-proph-yellow/80"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-profile-title"
    >
      <div
        ref={contentRef}
        className={`bg-proph-black rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out ${entered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} border border-proph-grey-light`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-proph-grey-text/20">
          <button
            onClick={onClose}
            className="text-proph-white hover:text-proph-yellow transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 id="player-profile-title" className="text-lg font-bold text-proph-white">
            {player.name}
          </h2>

          <button
            onClick={onClose}
            className="text-proph-white hover:text-proph-yellow transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Player Card */}
        <div className="flex items-center justify-center p-6 min-h-[580px]">
          <PlayerCardFinal1 player={player} />
        </div>

        {/* Actions */}
        <div className="p-4 space-y-3 border-t border-proph-grey-text/20 pb-safe">
          {is_being_reviewed && application ? (
            <>
              {/* Accept and Reject buttons for review mode */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onAccept && application.id) {
                      onAccept(application.id);
                      onClose(); // Close profile modal when opening accept modal
                    }
                  }}
                  className="flex-1 bg-proph-yellow text-proph-black font-semibold text-sm md:text-base py-2.5 md:py-3 px-4 md:px-6 rounded-lg hover:bg-proph-yellow/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-3 h-3 md:w-4 md:h-4" />
                  Accept
                </button>
                <button
                  onClick={() => {
                    if (onReject && application.id) {
                      onReject(application.id);
                      onClose(); // Close profile modal when opening reject modal
                    }
                  }}
                  className="flex-1 bg-proph-black border border-proph-yellow text-proph-yellow font-semibold text-sm md:text-base py-2.5 md:py-3 px-4 md:px-6 rounded-lg hover:bg-proph-grey-light/40 transition-colors flex items-center justify-center gap-2"
                >
                  <XIcon className="w-3 h-3 md:w-4 md:h-4" />
                  Dismiss
                </button>
              </div>
              {/* Share button below Accept/Reject */}
              <button
                onClick={handleShare}
                className="w-full bg-proph-grey-light hover:bg-proph-grey-text/20 text-proph-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Profile
              </button>
            </>
          ) : (
            <>
              {/* Normal mode - just Share button */}
              <button
                onClick={handleShare}
                className="w-full bg-proph-grey-light hover:bg-proph-grey-text/20 text-proph-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Profile
              </button>

              {showViewTeam && (
                <button
                  onClick={() => console.log('View Team Page')}
                  className="w-full bg-proph-yellow hover:bg-proph-yellow/90 text-proph-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  View Team Page
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


