import React from 'react';
import type { Posting } from '../../../types';
import { Calendar, Users, MoreVertical } from 'lucide-react';

interface PostingCardProps {
  posting: Posting;
  onApply: (postingId: string) => void;
  hasApplied?: boolean;
}

export const PostingCardCleanWhitespace: React.FC<PostingCardProps> = ({ posting, onApply, hasApplied = false }) => {
  const req = posting.requirements;
  const dueLong = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const match = posting.matchScore ? `${posting.matchScore}% Match` : undefined;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {posting.school.logo && (
            <img src={posting.school.logo} alt={posting.school.name} className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div>
            <p className="text-lg font-bold text-slate-900 leading-tight">{posting.position}</p>
            <p className="text-sm text-slate-700">{posting.school.name}</p>
            <p className="text-sm text-slate-600">{posting.school.division}</p>
          </div>
        </div>
        <MoreVertical className="w-5 h-5 text-slate-400" />
      </div>

      {/* Requirements */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Requirements</p>
        <div className="space-y-1 text-sm text-slate-700">
          {req.height && <p>Height: {req.height}+</p>}
          {req.classYear && <p>Class: {req.classYear}</p>}
          {req.gpa && <p>GPA: {req.gpa}</p>}
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4" /> Apply by {dueLong}
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4" /> {posting.applicantCount} other applicants
        </p>
      </div>

      {/* CTA */}
      <div className="pt-2">
        {hasApplied ? (
          <div className="bg-slate-200 text-slate-600 font-bold py-4 rounded-xl text-center">Already Applied{match ? ` • ${match}` : ''}</div>
        ) : (
          <button onClick={() => onApply(posting.id)} className="w-full bg-proph-yellow text-black font-bold py-4 rounded-xl text-center hover:bg-[#E6D436]">
            Apply Now{match ? ` • ${match}` : ''}
          </button>
        )}
      </div>
    </div>
  );
};


