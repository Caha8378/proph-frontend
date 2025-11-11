import React, { useState } from 'react';
import type { PlayerProfile } from '../../types';
import { ExternalLink } from 'lucide-react';
import { UnderReviewBadge } from '../onboarding/UnderReviewBadge';

interface PlayerCardProps {
  player: PlayerProfile;
  flippable?: boolean; // default true
  visitOnClick?: boolean; // default false - open modal instead of flip
  onVisit?: (player: PlayerProfile) => void; // called when visitOnClick
  showReviewBadge?: boolean; // default true - show "Under Review" badge
}

export const PlayerCardFinal1: React.FC<PlayerCardProps> = ({ player, flippable = true, visitOnClick = false, onVisit, showReviewBadge = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const percent = (v: number) => `${Math.round(v * 100)}%`;
  
  // Calculate percentages from makes/attempts if raw data is available
  const calculatePercentage = (makes: number | undefined, attempts: number | undefined): number => {
    if (makes !== undefined && attempts !== undefined && attempts > 0) {
      return makes / attempts;
    }
    return 0;
  };
  
  // Use calculated percentages if raw data exists, otherwise use provided percentages
  const fgPercentage = player.stats.fgm !== undefined && player.stats.fga !== undefined
    ? calculatePercentage(player.stats.fgm, player.stats.fga)
    : (player.stats.fgPercentage || 0);
    
  const threePtPercentage = player.stats.threepm !== undefined && player.stats.threepa !== undefined
    ? calculatePercentage(player.stats.threepm, player.stats.threepa)
    : (player.stats.threePtPercentage || 0);
    
  const ftPercentage = player.stats.ftm !== undefined && player.stats.fta !== undefined
    ? calculatePercentage(player.stats.ftm, player.stats.fta)
    : (player.stats.ftPercentage || 0);
  
  // Get steals and blocks - check for spg/bpg first (database field names), then fall back to steals/blocks
  const steals = (player.stats as any).spg !== undefined ? (player.stats as any).spg : (player.stats.steals || 0);
  const blocks = (player.stats as any).bpg !== undefined ? (player.stats as any).bpg : (player.stats.blocks || 0);

  return (
    <div 
      className="relative w-[315px] h-[540px] mx-auto cursor-pointer"
      onClick={() => {
        if (visitOnClick && onVisit) {
          onVisit(player);
          return;
        }
        if (flippable) setIsFlipped(!isFlipped);
      }}
    >
      <div className={`absolute inset-0 transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* FRONT - No Labels Style */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden">
          {/* Proph Logo Top Left */}
          <div className="absolute top-3 left-3 z-10">
            <h1 
              className="text-proph-yellow font-bold text-xl"
              style={{ 
                textShadow: '0 0 10px rgba(255, 236, 60, 0.5)',
                letterSpacing: '-2px'
              }}
            >
              Proph
            </h1>
          </div>
          
          {/* Under Review Badge - Top Right */}
          {showReviewBadge && player.verified === false && <UnderReviewBadge />}

          {/* Photo Section - 60% */}
          <div className="relative h-[60%] overflow-hidden">
            <img 
              src={player.photo || '/defualt.webp'} 
              alt={player.name}
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay for top corners (for logo/badge contrast) */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-bl from-black/40 via-transparent to-transparent" />
            {/* STRONG gradient scrim for bottom (for name text) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            
            {/* Name at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p 
                className="text-xl font-black text-white leading-tight mb-0.5"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
              >
                {player.name}
              </p>
              <p 
                className="text-xs font-semibold text-white/95"
                style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
              >
                {player.position} • Class of {player.classYear}
              </p>
            </div>
          </div>

          {/* Yellow Proph Strip */}
          <div className="bg-proph-yellow py-2.5 px-3 flex items-baseline justify-between border-b-2 border-black">
            <div>
              <p className="text-[9px] font-black uppercase text-black/60 tracking-wider leading-none">Your Proph</p>
              <h3 className="text-xl font-black text-black leading-none mt-0.5">{player.evaluation.level}</h3>
            </div>
          </div>

          {/* Info Section - NO LABELS - Clean values only */}
          <div className="flex-1 bg-proph-grey p-3">
            <div className="flex justify-between items-start mb-2.5 text-proph-white">
              <p className="text-sm font-bold">{player.school}</p>
              <div className="text-right">
                <p className="text-sm font-bold">
                  {player.height}
                  {(player.weight !== undefined && player.weight !== null && player.weight > 0) && (
                    <> • {player.weight} lbs</>
                  )}
                </p>
              </div>
            </div>
            <p className="text-xs text-proph-grey-text mb-2.5">{player.location}</p>
            
            {/* Key stats */}
            <div className="flex justify-around py-2 border-t border-proph-grey-light">
              <div className="text-center">
                <p className="text-base font-bold text-proph-yellow">{player.stats.ppg}</p>
                <p className="text-[9px] text-proph-grey-text">PPG</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-proph-yellow">{player.stats.rpg}</p>
                <p className="text-[9px] text-proph-grey-text">RPG</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-proph-yellow">{player.stats.apg}</p>
                <p className="text-[9px] text-proph-grey-text">APG</p>
              </div>
            </div>

            {flippable && (
              <p className="text-[10px] text-proph-grey-text text-center mt-2">Tap to flip</p>
            )}
          </div>
        </div>

        {/* BACK - 2x4 Stats Grid */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-proph-grey rounded-2xl p-4 space-y-2.5 overflow-y-auto">
          {/* Proph Logo */}
          <div className="mb-1">
            <h1 
              className="text-proph-yellow font-bold text-xl"
              style={{ 
                textShadow: '0 0 10px rgba(255, 236, 60, 0.5)',
                letterSpacing: '-2px'
              }}
            >
              Proph
            </h1>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase text-proph-yellow tracking-wide mb-2">Season Stats</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries({
                'PPG': player.stats.ppg,
                'RPG': player.stats.rpg,
                'APG': player.stats.apg,
                'SPG': steals,
                'FG%': fgPercentage > 0 ? percent(fgPercentage) : 'N/A',
                '3PT%': threePtPercentage > 0 ? percent(threePtPercentage) : 'N/A',
                'FT%': ftPercentage > 0 ? percent(ftPercentage) : 'N/A',
                'BPG': blocks,
              }).map(([label, value]) => (
                <div key={label} className="border border-proph-grey-light rounded-lg p-1.5 text-center bg-proph-black">
                  <p className="text-proph-grey-text text-[9px]">{label}</p>
                  <p className="text-proph-white font-bold text-xs">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {player.highlightVideoLink && (
            <button 
              className="w-full bg-proph-yellow text-proph-black font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(player.highlightVideoLink, '_blank');
              }}
            >
              View Highlights <ExternalLink className="w-4 h-4" />
            </button>
          )}

          <div>
            <h4 className="text-[10px] font-bold uppercase text-proph-yellow tracking-wide mb-1.5">Shades Of</h4>
            <p className="text-xs text-proph-white">{player.evaluation.comparisons.length > 0 ? player.evaluation.comparisons.join(', ') : 'N/A'}</p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase text-proph-yellow tracking-wide mb-1.5">Academic Info (Coaches only)</h4>
            {(player.gpa || player.sat || player.act) ? (
              <p className="text-xs text-proph-white">
                {[
                  player.gpa ? `GPA: ${player.gpa}` : null,
                  player.sat ? `SAT: ${player.sat}` : null,
                  player.act ? `ACT: ${player.act}` : null,
                ].filter(Boolean).join(' • ')}
              </p>
            ) : (
              <p className="text-xs text-proph-grey-text">N/A</p>
            )}
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase text-proph-yellow tracking-wide mb-1.5">Contact (Coaches only)</h4>
            {player.email && (
              <p className="text-xs text-proph-white">{player.email}</p>
            )}
            {player.phoneNumber && (
              <p className="text-xs text-proph-white">{player.phoneNumber}</p>
            )}
            {!player.email && !player.phoneNumber && (
              <p className="text-xs text-proph-grey-text">No contact info provided</p>
            )}
          </div>

          {flippable && (
            <p className="text-[10px] text-proph-grey-text text-center pt-1">Tap to flip back</p>
          )}
        </div>
      </div>
    </div>
  );
};