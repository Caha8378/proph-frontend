import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayerCardFinal1 } from '../player/PlayerCardFinal1';
import type { PlayerProfile } from '../../types';

interface PlayerAccordionProps {
  players: PlayerProfile[];
  autoRotate?: boolean;
  autoRotateInterval?: number;
  className?: string;
  onPlayerClick?: (player: PlayerProfile) => void;
}

export const PlayerAccordion: React.FC<PlayerAccordionProps> = ({
  players,
  autoRotate = true,
  autoRotateInterval = 5000,
  className = "",
  onPlayerClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || isHovered || players.length <= 1 || isAnimating) return;

    const interval = setInterval(() => {
      nextPlayer();
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, autoRotateInterval, isHovered, players.length, isAnimating]);

  const nextPlayer = () => {
    if (isAnimating) return;
    setDirection('left');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % players.length);
      setIsAnimating(false);
      setDirection(null);
    }, 500);
  };

  const prevPlayer = () => {
    if (isAnimating) return;
    setDirection('right');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + players.length) % players.length);
      setIsAnimating(false);
      setDirection(null);
    }, 500);
  };

  const getPlayerAtOffset = (offset: number) => {
    const index = (currentIndex + offset + players.length) % players.length;
    return players[index];
  };

  const getCardTransform = (position: 'left' | 'center' | 'right') => {
    const baseTransforms = {
      'left': {
        x: -100,
        scale: 0.90,
        rotate: 8,
        opacity: 0.5,
        zIndex: 2,
      },
      'center': {
        x: 0,
        scale: 1,
        rotate: 0,
        opacity: 1,
        zIndex: 10,
      },
      'right': {
        x: 100,
        scale: 0.90,
        rotate: -8,
        opacity: 0.5,
        zIndex: 2,
      },
    };

    let transform = baseTransforms[position];

    if (isAnimating && direction) {
      if (position === 'center') {
        if (direction === 'left') {
          transform = { ...transform, x: -300, opacity: 0 };
        } else {
          transform = { ...transform, x: 300, opacity: 0 };
        }
      } else if (position === 'right' && direction === 'left') {
        transform = { ...baseTransforms.center, x: 200, opacity: 0 };
      } else if (position === 'left' && direction === 'right') {
        transform = { ...baseTransforms.center, x: -200, opacity: 0 };
      }
    }

    return `translateX(${transform.x}px) scale(${transform.scale}) rotateY(${transform.rotate}deg)`;
  };

  const getCardOpacity = (position: 'left' | 'center' | 'right') => {
    const baseOpacity = {
      'left': 0.5,
      'center': 1,
      'right': 0.5,
    };

    if (isAnimating && direction) {
      if (position === 'center') {
        return 0;
      } else if (position === 'right' && direction === 'left') {
        return 0;
      } else if (position === 'left' && direction === 'right') {
        return 0;
      }
    }

    return baseOpacity[position];
  };

  const getCardZIndex = (position: 'left' | 'center' | 'right') => {
    const baseZIndex = {
      'left': 2,
      'center': 10,
      'right': 2,
    };

    if (isAnimating && direction) {
      if (position === 'right' && direction === 'left') return 11;
      if (position === 'left' && direction === 'right') return 11;
    }

    return baseZIndex[position];
  };

  if (players.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[600px] ${className}`}>
        <p className="text-proph-grey-text">No players available</p>
      </div>
    );
  }

  if (players.length === 1) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="max-w-sm">
          <PlayerCardFinal1 player={players[0]} />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Navigation Controls - NOW AT TOP */}
      <div 
        className="flex items-center justify-center gap-4 mb-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Previous Button */}
        <button
          onClick={prevPlayer}
          disabled={isAnimating}
          className={`bg-proph-black/80 hover:bg-proph-black text-proph-white p-2 rounded-full transition-colors duration-200 ${
            isAnimating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Previous player"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center space-x-2">
          {players.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (isAnimating) return;
                if (index > currentIndex) {
                  setDirection('left');
                } else if (index < currentIndex) {
                  setDirection('right');
                }
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                  setDirection(null);
                }, 500);
              }}
              disabled={isAnimating || index === currentIndex}
              className={`transition-all duration-200 rounded-full ${
                index === currentIndex 
                  ? 'w-8 h-3 bg-proph-yellow' 
                  : 'w-3 h-3 bg-proph-grey-text/30 hover:bg-proph-grey-text/50'
              } ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={`Go to player ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextPlayer}
          disabled={isAnimating}
          className={`bg-proph-black/80 hover:bg-proph-black text-proph-white p-2 rounded-full transition-colors duration-200 ${
            isAnimating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Next player"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Card Stack Container */}
      <div className="relative h-[550px] flex items-center justify-center overflow-hidden">
        {/* Left card (previous) */}
        <div 
          className="absolute transition-all duration-500 ease-out cursor-pointer hover:scale-[0.88]"
          onClick={onPlayerClick ? undefined : prevPlayer}
          style={{
            transform: getCardTransform('left'),
            opacity: getCardOpacity('left'),
            zIndex: getCardZIndex('left'),
          }}
        >
          <div className="max-w-sm">
            <PlayerCardFinal1 player={getPlayerAtOffset(-1)} flippable={false} visitOnClick={!!onPlayerClick} onVisit={onPlayerClick} />
          </div>
        </div>

        {/* Center card (current - active) */}
        <div 
          className="relative transition-all duration-500 ease-out"
          style={{
            transform: getCardTransform('center'),
            opacity: getCardOpacity('center'),
            zIndex: getCardZIndex('center'),
          }}
          onClick={() => onPlayerClick && onPlayerClick(getPlayerAtOffset(0))}
        >
          <div className="max-w-sm shadow-2xl">
            <PlayerCardFinal1 player={getPlayerAtOffset(0)} flippable={false} visitOnClick={!!onPlayerClick} onVisit={onPlayerClick} />
          </div>
        </div>

        {/* Right card (next) */}
        <div 
          className="absolute transition-all duration-500 ease-out cursor-pointer hover:scale-[0.88]"
          onClick={onPlayerClick ? undefined : nextPlayer}
          style={{
            transform: getCardTransform('right'),
            opacity: getCardOpacity('right'),
            zIndex: getCardZIndex('right'),
          }}
        >
          <div className="max-w-sm">
            <PlayerCardFinal1 player={getPlayerAtOffset(1)} flippable={false} visitOnClick={!!onPlayerClick} onVisit={onPlayerClick} />
          </div>
        </div>
      </div>
    </div>
  );
};