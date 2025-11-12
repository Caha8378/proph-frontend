import React, { useMemo } from 'react';
import type { Coach } from '../../types';

interface CoachBannerProps {
  coaches: Coach[];
  currentUserId?: string;
}

/**
 * Gets the priority order for sorting coaches by position.
 * Lower number = higher priority (appears first).
 */
const getPositionPriority = (position: string): number => {
  const lower = position.toLowerCase();
  
  // Head Coach - highest priority
  if (lower.includes('head coach')) return 1;
  
  // Associate Head Coach / Associate Coach
  if (lower.includes('associate')) return 2;
  
  // Recruiting Coordinators / Director of Recruiting
  if (lower.includes('recruiting') || lower.includes('director of recruiting')) return 3;
  
  // Assistant Coaches
  if (lower.includes('assistant')) return 4;
  
  // Graduate Assistants / GA
  if (lower.includes('graduate assistant') || lower.includes('grad assistant') || lower === 'ga') return 5;
  
  // Unknown positions go to the end
  return 999;
};

/**
 * Sorts coaches by position hierarchy, then alphabetically by name.
 */
const sortCoaches = (coaches: Coach[]): Coach[] => {
  return [...coaches].sort((a, b) => {
    const priorityA = getPositionPriority(a.position);
    const priorityB = getPositionPriority(b.position);
    
    // First sort by position priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
};

export const CoachBanner: React.FC<CoachBannerProps> = ({ coaches, currentUserId }) => {
  const sortedCoaches = useMemo(() => sortCoaches(coaches), [coaches]);
  
  return (
    <div className="space-y-3 max-w-[600px] mx-auto">
      {sortedCoaches.map((coach) => {
        const isCurrentUser = currentUserId === coach.id;
        
        return (
          <div
            key={coach.id}
            className={`bg-proph-grey rounded-xl border p-4 md:p-6 flex items-center gap-4 md:gap-5 relative ${
              isCurrentUser 
                ? 'border-proph-yellow border-2' 
                : 'border-proph-grey-text/20'
            }`}
          >
            {/* Me Badge - Top Right */}
            {isCurrentUser && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-proph-yellow text-proph-black text-xs md:text-sm font-bold rounded">
                Me
              </span>
            )}
            
            {/* School Logo */}
            <img
              src={coach.school.logo}
              alt={coach.school.name}
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0"
            />
            
            {/* Coach Info */}
            <div className="flex-1 min-w-0">
              <p className={`font-bold truncate text-base md:text-lg ${isCurrentUser ? 'text-proph-yellow' : 'text-proph-white'}`}>
                {coach.name}
              </p>
              <p className="text-sm md:text-base text-proph-grey-text truncate">
                {coach.position}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

