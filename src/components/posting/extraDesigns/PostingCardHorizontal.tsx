import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Posting } from '../../../types';
import { Clock } from 'lucide-react';

interface PostingCardProps {
  posting: Posting;
  onApply: (postingId: string) => void;
  hasApplied?: boolean;
}

export const PostingCardHorizontal: React.FC<PostingCardProps> = ({ posting, onApply, hasApplied = false }) => {
  const navigate = useNavigate();
  const req = posting.requirements;
  const due = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  
  const getMatchLabel = (score?: number): string | null => {
    if (!score) return null;
    if (score >= 80) return 'Great Fit';
    if (score >= 60) return 'Good Fit';
    return 'Possible Fit';
  };
  
  const matchLabel = getMatchLabel(posting.matchScore);

  const reqString = [
    req.height ? `${req.height}+` : null,
    req.classYear ? `Class ${req.classYear}` : null,
    req.gpa ? `${req.gpa} GPA` : null
  ].filter(Boolean).join(' • ');

  return (
    <div className="bg-proph-grey rounded-2xl p-4 border border-proph-grey-text/20">
      <div className="flex gap-4" onClick={() => navigate(`/posting/${posting.id}`)}>
        {/* Large logo left */}
        {posting.school.logo && (
          <div className="flex-shrink-0">
            <img 
              src={posting.school.logo} 
              alt={posting.school.name} 
              className="w-24 h-24 rounded-xl object-cover"
            />
          </div>
        )}

        {/* Content right */}
        <div className="flex-1 min-w-0">
          {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-proph-white truncate">{posting.school.name}</h3>
              <p className="text-xs text-proph-grey-text">{posting.school.division}</p>
            </div>
            {matchLabel && (
              <span className="flex-shrink-0 text-xs font-semibold text-proph-success">{matchLabel}</span>
            )}
          </div>

          {/* Position */}
          <h4 className="text-xl font-extrabold text-proph-white mb-2">{posting.position}</h4>

          {/* Requirements inline */}
          {reqString && (
            <p className="text-xs text-proph-grey-text mb-3">{reqString}</p>
          )}

          {/* Bottom row: meta + button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-proph-purple">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {due}
              </span>
              <span>{posting.applicantCount} applied</span>
            </div>

            {hasApplied ? (
              <button 
                disabled 
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0 bg-white/10 text-proph-violet text-xs font-bold px-4 py-2 rounded-lg"
              >
                Applied
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(posting.id);
                }} 
                className="flex-shrink-0 bg-proph-yellow text-black text-xs font-black px-4 py-2 rounded-lg hover:bg-[#E6D436] transition-colors"
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

