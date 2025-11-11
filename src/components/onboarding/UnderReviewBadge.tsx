import React from 'react';
import { Clock } from 'lucide-react';

interface UnderReviewBadgeProps {
  className?: string;
}

export const UnderReviewBadge: React.FC<UnderReviewBadgeProps> = ({ className = '' }) => {
  // Default positioning: top-right
  // If className contains positioning classes, use those; otherwise default to top-2 right-2
  const hasPositioning = className.includes('top-') || className.includes('right-') || className.includes('left-') || className.includes('bottom-');
  const positionClasses = hasPositioning ? '' : 'top-2 right-2';
  
  return (
    <div className={`absolute ${positionClasses} bg-proph-yellow/20 border border-proph-yellow text-proph-yellow text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-20 ${className}`}>
      <Clock className="w-3 h-3" />
      Under Review
    </div>
  );
};

