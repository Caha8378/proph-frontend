import React from 'react';
import type { Posting } from '../../../types';

interface PostingCardProps {
  posting: Posting;
  onApply: (postingId: string) => void;
  hasApplied?: boolean;
}

export const PostingCardHeroLogo: React.FC<PostingCardProps> = ({ posting, onApply, hasApplied = false }) => {
  const requirementParts: string[] = [];
  if (posting.requirements.height) requirementParts.push(`${posting.requirements.height}+`);
  if (posting.requirements.classYear) requirementParts.push(`${posting.requirements.classYear}`);
  if (posting.requirements.gpa) requirementParts.push(`${posting.requirements.gpa} GPA`);

  const applicants = `${posting.applicantCount} applicants`;
  const due = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const match = posting.matchScore ? `${posting.matchScore}% Match` : undefined;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center space-y-3">
      {posting.school.logo && (
        <img src={posting.school.logo} alt={posting.school.name} className="w-20 h-20 mx-auto mb-1 rounded-lg object-cover" />
      )}
      <h3 className="text-xl font-bold text-slate-900">{posting.school.name}</h3>
      <p className="text-sm text-slate-600">{posting.school.division} • {posting.position}</p>
      {requirementParts.length > 0 && (
        <p className="text-xs text-slate-500">{requirementParts.join(' • ')}</p>
      )}
      <p className="text-xs text-slate-500">{applicants} • Due {due}</p>

      {hasApplied ? (
        <button disabled className="w-full bg-slate-200 text-slate-500 font-bold py-3 rounded-xl">Already Applied</button>
      ) : (
        <button onClick={() => onApply(posting.id)} className="w-full bg-proph-yellow text-black font-bold py-3 rounded-xl hover:bg-[#E6D436]">Apply Now</button>
      )}

      {match && (
        <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">{match}</div>
      )}
    </div>
  );
};


