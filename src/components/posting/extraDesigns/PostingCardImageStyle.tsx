import React from 'react';
import type { Posting } from '../../../types';
// import { Badge } from '../../common/Badge';

interface PostingCardProps {
  posting: Posting;
  onApply: (postingId: string) => void;
  hasApplied?: boolean;
}

export const PostingCardImageStyle: React.FC<PostingCardProps> = ({ posting, onApply, hasApplied = false }) => {
  const requirementParts: string[] = [];
  if (posting.requirements.height) requirementParts.push(`${posting.requirements.height}+`);
  if (posting.requirements.classYear) requirementParts.push(`Class ${posting.requirements.classYear}`);
  if (posting.requirements.gpa) requirementParts.push(`${posting.requirements.gpa} GPA`);

  const city = posting.school.location?.split(',')[0] || posting.school.location;
  const applicants = `${posting.applicantCount}`;
  const due = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const match = posting.matchScore ? `${posting.matchScore}% Match` : undefined;

  return (
    <div className="rounded-xl overflow-hidden shadow-md">
      {/* Top gradient section */}
      <div className="relative bg-gradient-to-br from-proph-yellow to-proph-blue p-6">
        {/* Logo */}
        {posting.school.logo && (
          <div className="absolute top-4 left-4 bg-white rounded-full p-2">
            <img src={posting.school.logo} alt={posting.school.name} className="w-12 h-12 rounded-full object-cover" />
          </div>
        )}
        {/* Match badge */}
        {match && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {match}
          </div>
        )}

        <div className="pt-12">
          <h4 className="text-2xl font-bold text-white">{posting.position}</h4>
          <p className="text-sm text-white/90">{posting.school.name} • {posting.school.division}</p>
        </div>
      </div>

      {/* Bottom white section */}
      <div className="bg-white p-4 space-y-3">
        {requirementParts.length > 0 && (
          <p className="text-sm text-slate-700">{requirementParts.join(' • ')}</p>
        )}
        <p className="text-xs text-slate-500">👥 {applicants}  ⏰ {due}  📍 {city}</p>

        {hasApplied ? (
          <button disabled className="w-full bg-slate-200 text-slate-500 font-bold py-3 rounded-lg">Already Applied</button>
        ) : (
          <button onClick={() => onApply(posting.id)} className="w-full bg-proph-yellow text-black font-bold py-3 rounded-lg hover:bg-[#E6D436]">Apply Now</button>
        )}
      </div>
    </div>
  );
};


