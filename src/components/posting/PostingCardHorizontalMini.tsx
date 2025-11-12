import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Posting } from '../../types';
import { Clock } from 'lucide-react';

interface PostingCardMiniProps {
  posting: Posting & { hasApplied?: boolean };
  onApply: (postingId: string) => void;
  hasApplied?: boolean; // Legacy prop, will use posting.hasApplied if not provided
}

export const PostingCardHorizontalMini: React.FC<PostingCardMiniProps> = ({ posting, onApply, hasApplied: hasAppliedProp }) => {
  const due = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const navigate = useNavigate();
  const req = posting.requirements;
  
  // Use posting.hasApplied from backend if available, otherwise fall back to prop
  const hasApplied = posting.hasApplied ?? hasAppliedProp ?? false;

  const reqString = [
    req.height ? `${req.height}+` : null,
    req.classYear ? `Class ${req.classYear}` : null,
    req.gpa ? `${req.gpa} GPA` : null
  ].filter(Boolean).join(' • ');

  return (
    <div className="bg-proph-grey rounded-2xl p-2 md:p-4 border border-proph-grey-text/20 w-full max-w-[600px] mx-auto cursor-pointer" onClick={() => navigate(`/posting/${posting.id}`)}>
      <div className="flex gap-3 md:gap-4 items-center">
        {/* Logo left */}
        {posting.school.logo && (
          <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
            <img
              src={posting.school.logo}
              alt={posting.school.name}
              className="w-full h-full rounded-lg object-contain p-0.5 md:p-1"
            />
          </div>
        )}

        {/* Content right */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-0.5">
            <h3 className="text-sm md:text-base font-bold text-proph-white truncate">{posting.school.name}</h3>
            {posting.school.division && (
              <p className="text-xs md:text-sm text-proph-grey-text truncate">
                {[posting.school.division, posting.school.conference].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          {/* Position */}
          <h4 className="text-base md:text-lg font-extrabold text-proph-white">{posting.position}</h4>

          {/* Requirements line */}
          {reqString && (
            <p className="text-xs md:text-sm text-proph-grey-text mb-1">{reqString}</p>
          )}

          {/* Bottom row: deadline + button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs md:text-sm text-proph-grey-text">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span>{due}</span>
              </span>
              {posting.applicantCount > 0 && (
                <span>{posting.applicantCount} applied</span>
              )}
            </div>

            {hasApplied ? (
              <button disabled className="flex-shrink-0 bg-white/10 text-proph-yellow text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-lg" onClick={(e) => e.stopPropagation()}>
                Applied
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onApply(posting.id); }}
                className="flex-shrink-0 bg-proph-yellow text-proph-black text-xs md:text-sm font-black px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-[#E6D436] transition-colors"
              >
                APPLY
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
