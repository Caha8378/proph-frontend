import React from 'react';
import { Badge } from '../../common/Badge';
// import { Button } from '../../common/Button';
import { Calendar } from 'lucide-react';
import type { Posting } from '../../../types';
import { isDeadlineUrgent, getMatchTier } from '../../../utils/helpers';
import { clsx } from 'clsx';

interface PostingCardProps {
  posting: Posting;
  onApply: (postingId: string) => void;
  hasApplied?: boolean;
}

export const PostingCard: React.FC<PostingCardProps> = ({
  posting,
  onApply,
  hasApplied = false,
}) => {
  const isUrgent = isDeadlineUrgent(posting.deadline);
  const matchTier = posting.matchScore ? getMatchTier(posting.matchScore) : null;
  const deadlineDate = new Date(posting.deadline).toISOString().slice(0, 10);

  const requirementParts: string[] = [];
  if (posting.requirements.height) {
    requirementParts.push(`${posting.requirements.height}+`);
  }
  if (posting.requirements.classYear) {
    requirementParts.push(`Class ${posting.requirements.classYear}`);
  }
  if (posting.requirements.gpa) {
    requirementParts.push(`${posting.requirements.gpa} GPA`);
  }

  return (
    <div className="space-y-4 bg-black rounded-none border border-white/5 border-l-4 border-proph-yellow p-4 transition-all duration-200 hover:border-white/10">
      {/* School Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {posting.school.logo && (
            <img
              src={posting.school.logo}
              alt={posting.school.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-bold text-white">
              {posting.school.name}
            </h3>
            <span className="inline-block bg-proph-yellow/20 text-proph-yellow text-xs font-bold px-2 py-1">
              {posting.school.division}
            </span>
          </div>
        </div>
        {matchTier && (
          <Badge variant={matchTier}>
            {matchTier === 'great-fit' && 'Great Fit'}
            {matchTier === 'good-fit' && 'Good Fit'}
            {matchTier === 'possible-fit' && 'Possible Fit'}
          </Badge>
        )}
      </div>

      {/* Position */}
      <h4 className="text-2xl font-extrabold text-white uppercase tracking-tight">
        {posting.position}
      </h4>

      {/* Requirements - single line */}
      {requirementParts.length > 0 && (
        <p className="text-sm text-proph-violet font-medium">
          {requirementParts.join(' • ')}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className={clsx('flex items-center gap-1', isUrgent ? 'text-proph-yellow' : 'text-proph-violet')}>
            <Calendar className="w-4 h-4" />
            Deadline: {deadlineDate}
          </span>
          <span className="text-proph-violet">
            {posting.applicantCount} players applied
          </span>
        </div>
      </div>

      {/* CTA */}
      {hasApplied ? (
        <button
          disabled
          className="w-full border-2 border-proph-violet/40 text-proph-violet bg-transparent font-semibold py-3 px-6"
        >
          Already Applied
        </button>
      ) : (
        <button
          onClick={() => onApply(posting.id)}
          className="w-full border-2 border-white text-white bg-transparent font-semibold py-3 px-6 hover:bg-proph-yellow hover:text-black hover:border-proph-yellow transition-colors"
        >
          Apply Now
        </button>
      )}
    </div>
  );
};
