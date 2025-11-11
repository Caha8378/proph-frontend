import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Posting } from '../../types';
import { Pencil, Trash2, Users, Clock } from 'lucide-react';
import { PostingStatusBadge } from './PostingStatusBadge';

interface PostingCardCoachProps {
  posting: Posting;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewApplications: (id: string) => void;
}

export const PostingCardCoach: React.FC<PostingCardCoachProps> = ({ posting, onEdit, onDelete, onViewApplications }) => {
  const due = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const navigate = useNavigate();

  return (
    <div className="bg-proph-grey rounded-2xl p-4 border border-proph-grey-text/20 relative">
      {/* Top row: status + actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {posting.status && <PostingStatusBadge status={posting.status} />}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(posting.id)} className="p-2 rounded-lg hover:bg-proph-grey-light" aria-label="Edit posting">
            <Pencil className="w-4 h-4 text-proph-white" />
          </button>
          <button onClick={() => onDelete(posting.id)} className="p-2 rounded-lg hover:bg-proph-grey-light" aria-label="Delete posting">
            <Trash2 className="w-4 h-4 text-proph-white" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-2 cursor-pointer" onClick={() => navigate(`/posting/${posting.id}`)}>
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-proph-black/40 flex items-center justify-center">
          {posting.school.logo ? (
            <img 
              src={posting.school.logo} 
              alt={posting.school.name} 
              className="w-full h-full object-contain p-1.5" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/defualt.webp';
              }}
            />
          ) : (
            <div className="w-full h-full bg-proph-grey flex items-center justify-center">
              <span className="text-proph-grey-text text-xs">No Logo</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-proph-white truncate">{posting.school.name}</h3>
          <p className="text-xs text-proph-grey-text truncate">
            {[posting.school.division, posting.school.conference].filter(Boolean).join(' • ')}
          </p>
        </div>
      </div>

      {/* Position */}
      <h4 className="text-xl font-extrabold text-proph-white mb-2 cursor-pointer" onClick={() => navigate(`/posting/${posting.id}`)}>{posting.position}</h4>

      {/* Requirements inline */}
      <p className="text-xs text-proph-grey-text mb-3">
        {[posting.requirements.height, posting.requirements.classYear ? `Class of ${posting.requirements.classYear}` : null, posting.requirements.gpa ? `${posting.requirements.gpa} GPA` : null]
          .filter(Boolean)
          .join(' • ')}
      </p>

      {/* Meta + button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-proph-purple">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {due}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {posting.applicantCount} applications
          </span>
        </div>
        <button onClick={() => onViewApplications(posting.id)} className="bg-proph-yellow text-proph-black text-xs font-black px-4 py-2 rounded-lg hover:bg-[#E6D436] transition-colors">
          Review Applications
        </button>
      </div>
    </div>
  );
};


