import React from 'react';

type Status = 'active' | 'expired' | 'filled' | 'draft';

export const PostingStatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const styles: Record<Status, string> = {
    active: 'bg-proph-success/20 text-proph-success',
    expired: 'bg-proph-error/20 text-proph-error',
    filled: 'bg-proph-grey-text/20 text-proph-grey-text',
    draft: 'bg-proph-yellow/20 text-proph-yellow',
  };
  return (
    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${styles[status]}`}>{status}</span>
  );
};


