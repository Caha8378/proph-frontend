import React, { useState } from 'react';
import type { Application } from '../../types';
import { Clock, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { formatRelativeDate } from '../../utils/helpers';

interface ApplicationCardCoachProps {
  application: Application;
  onViewProfile: (playerId: string, application: Application) => void;
  onAccept: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
}

export const ApplicationCardCoach: React.FC<ApplicationCardCoachProps> = ({ application, onViewProfile }) => {
  const { player, appliedAt, applicationMessage } = application;
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);

  const handleCardClick = () => {
    // Use userId (numeric) if available, otherwise use id (string)
    // The API expects the player's user_id
    const playerId = player.userId ? String(player.userId) : player.id;
    onViewProfile(playerId, application);
  };

  return (
    <div 
      className="bg-proph-grey rounded-xl border border-proph-yellow p-4 md:p-6 flex flex-col gap-3 cursor-pointer hover:bg-proph-grey-light transition-colors max-w-[600px] mx-auto relative"
      onClick={handleCardClick}
    >
      {/* Click to view text - top right */}
      <div className="absolute top-4 right-4">
        <p className="text-xs text-proph-grey-text">click to view</p>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          {player.photo ? (
            <img src={player.photo} alt={player.name} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-proph-grey-light flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 md:w-6 md:h-6 text-proph-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base md:text-lg font-bold text-proph-white truncate">{player.name}</p>
            <p className="text-sm md:text-base text-proph-grey-text truncate">
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

      {/* Timeline and Message on same line */}
      <div className="flex items-center justify-between gap-2 text-xs md:text-sm text-proph-grey-text">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          <span>Applied {formatRelativeDate(appliedAt)}</span>
        </div>
        {applicationMessage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMessageExpanded(!isMessageExpanded);
            }}
            className="flex items-center gap-1.5 hover:text-proph-white transition-colors"
          >
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            <span>View Message</span>
            {isMessageExpanded ? (
              <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
        )}
      </div>

      {/* Expanded Message Section */}
      {isMessageExpanded && applicationMessage && (
        <div 
          className="pt-3 border-t border-proph-grey-text/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-2 mb-2">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-proph-grey-text/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare className="w-3 h-3 md:w-4 md:h-4 text-proph-grey-text" />
            </div>
            <span className="text-xs md:text-sm font-semibold text-proph-grey-text">Application Message</span>
          </div>
          <p className="text-sm md:text-base text-proph-white leading-relaxed pl-7 md:pl-8">
            {applicationMessage}
          </p>
        </div>
      )}
    </div>
  );
};



