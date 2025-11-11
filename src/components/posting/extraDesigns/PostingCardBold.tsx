import React from 'react';
import type { Posting } from '../../../types';
import { Calendar, Users } from 'lucide-react';

interface PostingCardProps {
  posting: Posting;
  onApply: (postingId: string) => void;
  hasApplied?: boolean;
}

export const PostingCardBold: React.FC<PostingCardProps> = ({ posting, onApply, hasApplied = false }) => {
  const req = posting.requirements;
  const due = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  
  const getMatchLabel = (score?: number): string | null => {
    if (!score) return null;
    if (score >= 80) return 'Great Fit';
    if (score >= 60) return 'Good Fit';
    return 'Possible Fit';
  };
  
  const matchLabel = getMatchLabel(posting.matchScore);

  return (
    <div className="bg-black rounded-2xl overflow-hidden border border-white/10">
      {/* Top section with large logo */}
      <div className="relative bg-gradient-to-br from-proph-surface to-black p-6">
        {posting.school.logo && (
          <div className="flex justify-center mb-4">
            <img 
              src={posting.school.logo} 
              alt={posting.school.name} 
              className="w-32 h-32 rounded-2xl object-cover shadow-2xl"
            />
          </div>
        )}
        <h3 className="text-2xl font-extrabold text-white text-center mb-1">{posting.school.name}</h3>
        <p className="text-sm text-proph-violet text-center">{posting.school.division} • {posting.school.location}</p>
      </div>

      {/* Content section */}
      <div className="p-6 space-y-4">
        {/* Position - prominent */}
        <div>
          <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{posting.position}</h4>
          {matchLabel && (
            <div className="inline-block bg-proph-yellow text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
              {matchLabel}
            </div>
          )}
        </div>

        {/* Requirements */}
        {(req.height || req.classYear || req.gpa) && (
          <div className="flex flex-wrap gap-2">
            {req.height && <span className="bg-white/5 text-proph-text text-sm px-3 py-1 rounded-lg">{req.height}+</span>}
            {req.classYear && <span className="bg-white/5 text-proph-text text-sm px-3 py-1 rounded-lg">Class {req.classYear}</span>}
            {req.gpa && <span className="bg-white/5 text-proph-text text-sm px-3 py-1 rounded-lg">{req.gpa} GPA</span>}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-proph-violet">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {due}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {posting.applicantCount}
          </span>
        </div>

        {/* CTA */}
        {hasApplied ? (
          <button disabled className="w-full bg-white/10 text-proph-violet font-bold py-4 rounded-xl">
            Already Applied
          </button>
        ) : (
          <button 
            onClick={() => onApply(posting.id)} 
            className="w-full bg-proph-yellow text-black font-black py-4 rounded-xl hover:bg-[#E6D436] transition-colors"
          >
            APPLY NOW
          </button>
        )}
      </div>
    </div>
  );
};

