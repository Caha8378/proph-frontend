import React, { useState } from 'react';
import type { Application } from '../../types';
import { Clock, Check, X as XIcon, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { formatRelativeDate } from '../../utils/helpers';

interface ApplicationCardCoachProps {
  application: Application;
  onViewProfile: (playerId: string) => void;
  onAccept: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
}

export const ApplicationCardCoach: React.FC<ApplicationCardCoachProps> = ({ application, onViewProfile, onAccept, onReject }) => {
  const { player, status, appliedAt, id, applicationMessage } = application;
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);

  const handleCardClick = () => {
    // Use userId (numeric) if available, otherwise use id (string)
    // The API expects the player's user_id
    const playerId = player.userId ? String(player.userId) : player.id;
    onViewProfile(playerId);
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent card click when clicking buttons
    action();
  };

  return (
    <div 
      className="bg-proph-grey rounded-xl border border-proph-yellow p-4 flex flex-col gap-3 cursor-pointer hover:bg-proph-grey-light transition-colors"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {player.photo ? (
            <img src={player.photo} alt={player.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-proph-grey-light flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-proph-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-proph-white truncate">{player.name}</p>
            <p className="text-sm text-proph-grey-text truncate">
              {(() => {
                const parts: string[] = [];
                if (player.height) parts.push(player.height);
                if (player.weight) parts.push(`${player.weight} lbs`);
                if (player.classYear) parts.push(`Class of ${player.classYear}`);
                return parts.length > 0 ? parts.join(' • ') : 'No details available';
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-2 text-xs text-proph-grey-text">
        <Clock className="w-4 h-4" />
        <span>Applied {formatRelativeDate(appliedAt)}</span>
      </div>

      {/* Actions */}
      {status === 'pending' ? (
        <>
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {applicationMessage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMessageExpanded(!isMessageExpanded);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-proph-grey-text hover:text-proph-white hover:bg-proph-grey-light/30 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>View Message</span>
                </div>
                {isMessageExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
            <div className="flex gap-2">
              <button 
                onClick={(e) => handleButtonClick(e, () => onAccept(id))} 
                className="flex-1 bg-proph-black text-proph-yellow font-semibold text-sm py-2.5 px-4 rounded-lg hover:bg-proph-grey-light transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-3 h-3" />Accept
              </button>
              <button 
                onClick={(e) => handleButtonClick(e, () => onReject(id))} 
                className="flex-1 bg-proph-black text-proph-white font-semibold text-sm py-2.5 px-4 rounded-lg hover:bg-proph-grey-light transition-colors flex items-center justify-center gap-2"
              >
                <XIcon className="w-3 h-3" />Dismiss
              </button>
            </div>
          </div>
          
          {/* Expanded Message Section */}
          {isMessageExpanded && applicationMessage && (
            <div 
              className="mt-2 pt-3 border-t border-proph-grey-text/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="w-5 h-5 rounded-full border border-proph-grey-text/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-3 h-3 text-proph-grey-text" />
                </div>
                <span className="text-xs font-semibold text-proph-grey-text">Application Message</span>
              </div>
              <p className="text-sm text-proph-white leading-relaxed pl-7">
                {applicationMessage}
              </p>
            </div>
          )}
        </>
      ) : status === 'accepted' ? (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            disabled 
            className="flex-1 bg-proph-black/40 text-proph-grey-text font-semibold text-sm py-2.5 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />Accepted
          </button>
        </div>
      ) : (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            disabled 
            className="flex-1 bg-proph-black/40 text-proph-grey-text font-semibold text-sm py-2.5 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
          >
            <XIcon className="w-4 h-4" />Rejected
          </button>
        </div>
      )}
    </div>
  );
};



