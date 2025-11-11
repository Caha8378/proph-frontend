import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { Application } from '../../types';
import { formatRelativeDate } from '../../utils/helpers';

interface ApplicationCardProps {
  application: Application;
  onViewPosting?: (postingId: string) => void;
  onMessageCoach?: (coachId: string) => void;
  onWithdraw?: (applicationId: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onViewPosting,
  onMessageCoach,
  onWithdraw,
}) => {
  const { posting, status, appliedAt } = application;

  return (
    <Card className="space-y-4">
      {/* School Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {posting.school.logo && (
            <img
              src={posting.school.logo}
              alt={posting.school.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="font-bold text-proph-text">
              {posting.school.name}
            </h3>
            <p className="text-sm text-proph-violet">{posting.position}</p>
          </div>
        </div>
        <Badge variant={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-proph-violet">
        <span>Applied {formatRelativeDate(appliedAt)}</span>
        {status === 'pending' && posting.applicantCount && (
          <span>{posting.applicantCount} other applicants</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {status === 'pending' && (
          <>
            {onViewPosting && (
              <Button
                variant="secondary"
                onClick={() => onViewPosting(posting.id)}
              >
                View Posting
              </Button>
            )}
            {onWithdraw && (
              <Button
                variant="ghost"
                fullWidth={false}
                onClick={() => onWithdraw(application.id)}
                className="text-proph-error hover:text-proph-error/80"
              >
                Withdraw
              </Button>
            )}
          </>
        )}

        {status === 'accepted' && (
          <>
            {onMessageCoach && (
              <Button
                variant="success"
                onClick={() => onMessageCoach(posting.coachName)}
              >
                Message Coach
              </Button>
            )}
            {onViewPosting && (
              <Button
                variant="secondary"
                fullWidth={false}
                onClick={() => onViewPosting(posting.id)}
              >
                View Profile
              </Button>
            )}
          </>
        )}

        {status === 'rejected' && onViewPosting && (
          <Button
            variant="secondary"
            onClick={() => onViewPosting(posting.id)}
          >
            View Posting
          </Button>
        )}
      </div>
    </Card>
  );
};
