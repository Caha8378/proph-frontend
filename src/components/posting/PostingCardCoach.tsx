import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Posting } from '../../types';
import { Pencil, Trash2, Users, Clock } from 'lucide-react';
import { PostingStatusBadge } from './PostingStatusBadge';

// Helper function to convert inches to feet'inches" format
const formatHeight = (heightInches: number | undefined | null): string | null => {
  if (!heightInches || heightInches <= 0) return null;
  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;
  return `${feet}'${inches}"+`;
};

interface PostingCardCoachProps {
  posting: Posting;
  onEdit: (id: string) => void;
  onDelete: (posting: Posting) => void;
  onViewApplications?: (id: string) => void; // Optional for backward compatibility
}

export const PostingCardCoach: React.FC<PostingCardCoachProps> = ({ posting, onEdit, onDelete, onViewApplications }) => {
  const due = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const navigate = useNavigate();
  
  // Get height in display format (check heightInches first, then fall back to height string)
  const heightDisplay = (posting.requirements as any)?.heightInches 
    ? formatHeight((posting.requirements as any).heightInches)
    : posting.requirements.height || null;

  return (
    <div className="bg-proph-grey rounded-2xl p-4 md:p-6 border border-proph-grey-text/20 relative max-w-[600px] mx-auto">
      {/* Top row: status + actions */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {posting.status && <PostingStatusBadge status={posting.status} />}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(posting.id)} className="p-2 md:p-2.5 rounded-lg hover:bg-proph-grey-light" aria-label="Edit posting">
            <Pencil className="w-4 h-4 md:w-5 md:h-5 text-proph-white" />
          </button>
          {(posting.is_general || !posting.can_delete) ? (
            <div className="relative group">
              <button 
                disabled 
                className="p-2 md:p-2.5 rounded-lg opacity-50 cursor-not-allowed" 
                aria-label="Delete posting (protected)"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-proph-white" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-proph-black text-proph-white text-xs rounded py-1 px-2 whitespace-nowrap border border-proph-grey-text/20">
                  General interest postings cannot be deleted
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => onDelete(posting)} className="p-2 md:p-2.5 rounded-lg hover:bg-proph-grey-light" aria-label="Delete posting">
              <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-proph-white" />
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-3 cursor-pointer" onClick={() => navigate(`/posting/${posting.id}`)}>
        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-proph-black/40 flex items-center justify-center">
          {posting.school.logo ? (
            <img 
              src={posting.school.logo} 
              alt={posting.school.name} 
              className="w-full h-full object-contain p-1.5 md:p-2" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/defualt.webp';
              }}
            />
          ) : (
            <div className="w-full h-full bg-proph-grey flex items-center justify-center">
              <span className="text-proph-grey-text text-xs md:text-sm">No Logo</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg md:text-xl font-bold text-proph-white truncate">{posting.school.name}</h3>
          <p className="text-xs md:text-sm text-proph-grey-text truncate">
            {[posting.school.division, posting.school.conference].filter(Boolean).join(' • ')}
          </p>
        </div>
      </div>

      {/* Position */}
      <h4 className="text-xl md:text-2xl font-extrabold text-proph-white mb-2 md:mb-3 cursor-pointer" onClick={() => navigate(`/posting/${posting.id}`)}>{posting.position}</h4>

      {/* Requirements inline */}
      <p className="text-xs md:text-sm text-proph-grey-text mb-3 md:mb-4">
        {[heightDisplay, posting.requirements.classYear !== undefined && posting.requirements.classYear !== null 
          ? (posting.requirements.classYear === 1 ? 'Eligible next season' : `Class of ${posting.requirements.classYear}`)
          : null, posting.requirements.gpa ? `${posting.requirements.gpa} GPA` : null]
          .filter(Boolean)
          .join(' • ')}
      </p>

      {/* Meta + button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs md:text-sm text-proph-purple">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            {due}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            {posting.applicantCount} applications
          </span>
        </div>
        <button 
          onClick={() => {
            navigate(`/coach/applications?id=${posting.id}`);
            // Call callback if provided for backward compatibility
            onViewApplications?.(posting.id);
          }} 
          className="bg-proph-yellow text-proph-black text-xs md:text-sm font-black px-4 md:px-6 py-2 md:py-2.5 rounded-lg hover:bg-[#E6D436] transition-colors"
        >
          Review Applications
        </button>
      </div>
    </div>
  );
};


