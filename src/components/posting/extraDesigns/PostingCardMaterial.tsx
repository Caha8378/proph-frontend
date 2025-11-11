import React from 'react';
import type { Posting } from '../../../types';
import { Calendar, Users, Award } from 'lucide-react';

interface PostingCardProps {
  posting: Posting;
  onApply: (postingId: string) => void;
  hasApplied?: boolean;
}

export const PostingCardMaterial: React.FC<PostingCardProps> = ({ posting, onApply, hasApplied = false }) => {
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
    <div className="bg-proph-surface rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Hero section with logo overlay */}
      <div className="relative h-32 bg-gradient-to-br from-proph-yellow/20 via-proph-violet/20 to-proph-blue/20">
        {/* Floating logo */}
        {posting.school.logo && (
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={posting.school.logo} 
                alt={posting.school.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Match badge top-right */}
        {matchLabel && (
          <div className="absolute top-4 right-4 bg-proph-yellow text-black text-sm font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg uppercase">
            <Award className="w-4 h-4" />
            {matchLabel}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-16 px-6 pb-6 space-y-4">
        {/* School info */}
        <div>
          <h3 className="text-xl font-extrabold text-white mb-1">{posting.school.name}</h3>
          <p className="text-sm text-proph-violet">{posting.school.division} • {posting.school.location}</p>
        </div>

        {/* Position */}
        <div>
          <p className="text-xs text-proph-violet uppercase tracking-wide mb-1">Open Position</p>
          <h4 className="text-2xl font-black text-white uppercase tracking-tight">{posting.position}</h4>
        </div>

        {/* Requirements grid */}
        {(req.height || req.classYear || req.gpa) && (
          <div className="grid grid-cols-3 gap-2">
            {req.height && (
              <div className="bg-black/40 rounded-lg p-2 text-center">
                <p className="text-xs text-proph-violet">Height</p>
                <p className="text-sm font-bold text-white">{req.height}+</p>
              </div>
            )}
            {req.classYear && (
              <div className="bg-black/40 rounded-lg p-2 text-center">
                <p className="text-xs text-proph-violet">Class</p>
                <p className="text-sm font-bold text-white">{req.classYear}</p>
              </div>
            )}
            {req.gpa && (
              <div className="bg-black/40 rounded-lg p-2 text-center">
                <p className="text-xs text-proph-violet">GPA</p>
                <p className="text-sm font-bold text-white">{req.gpa}</p>
              </div>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-proph-violet pt-2">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Due {due}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {posting.applicantCount}
          </span>
        </div>

        {/* CTA */}
        {hasApplied ? (
          <button disabled className="w-full bg-white/10 text-proph-violet font-bold py-4 rounded-2xl mt-2">
            Application Submitted
          </button>
        ) : (
          <button 
            onClick={() => onApply(posting.id)} 
            className="w-full bg-proph-yellow text-black font-black py-4 rounded-2xl hover:bg-[#E6D436] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-2"
          >
            APPLY NOW
          </button>
        )}
      </div>
    </div>
  );
};

