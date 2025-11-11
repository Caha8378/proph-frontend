import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Application } from '../../types';
import { Calendar, Clock, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatRelativeDate } from '../../utils/helpers';
import { WithdrawModal } from './WithdrawModal';
import * as applicationsService from '../../api/applications';

interface Props {
  application: Application;
  onMessage: (id: string) => Promise<void> | void;
  onWithdraw: (id: string) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
}

export const ApplicationCardV1: React.FC<Props> = ({ application, onMessage, onWithdraw, onRemove }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { posting, status, appliedAt } = application;

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleWithdrawConfirm = async () => {
    try {
      setLoading(true);
      await applicationsService.withdrawApplication(application.id);
      // Call the parent's onWithdraw callback to refresh the list
      await onWithdraw(application.id);
      setShowWithdrawModal(false);
    } catch (error: any) {
      console.error('Error withdrawing application:', error);
      alert(error.message || 'Failed to withdraw application');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove this application from your list?')) return;
    setLoading(true); 
    await onRemove(application.id); 
    setLoading(false);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-proph-grey-text" />;
      case 'accepted':
        return <ThumbsUp className="w-4 h-4 text-proph-grey-text" />;
      case 'rejected':
        return <ThumbsDown className="w-4 h-4 text-proph-grey-text" />;
    }
  };

  const handleViewPosting = () => {
    navigate(`/posting/${posting.id}`);
  };

  return (
    <div className="bg-proph-grey rounded-xl border border-proph-grey-text/20 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
          <img 
            src={posting.school.logo || '/defualt.webp'} 
            alt={posting.school.name} 
            className="w-full h-full object-contain p-1" 
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-proph-white truncate">{posting.school.name}</p>
          <p className="text-sm text-proph-grey-text truncate">{posting.position}</p>
        </div>
      </div>

      {/* Timeline with status icon */}
      <div className="text-xs text-proph-grey-text flex items-center justify-between">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Applied {formatRelativeDate(appliedAt)}
        </span>
        <span className="inline-flex items-center">
          {getStatusIcon()}
        </span>
      </div>

      <div className="border-t border-proph-grey-text/10" />

      {/* Actions */}
      {status === 'pending' && (
        <div className="flex items-center justify-between">
          <button onClick={handleViewPosting} className="bg-proph-yellow text-proph-black font-semibold py-1 px-4 rounded-xl hover:bg-proph-yellow/90">View Posting</button>
          <button disabled={loading} onClick={handleWithdrawClick} className="text-proph-error text-sm hover:underline">Withdraw</button>
        </div>
      )}

      {status === 'accepted' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-proph-success/10 p-2 rounded text-sm text-proph-success">
            <MessageSquare className="w-4 h-4" /> Coach wants to connect!
          </div>
          <div className="flex items-center justify-between">
            <button disabled={loading} onClick={() => onMessage(application.id)} className="bg-proph-yellow text-proph-black font-semibold py-1 px-4 rounded-xl hover:bg-proph-yellow/90">
              Message
            </button>
            
            <button disabled={loading} onClick={handleWithdrawClick} className="text-proph-error text-sm hover:underline">Withdraw</button>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="flex items-center justify-between">
          <button onClick={handleViewPosting} className="bg-proph-yellow text-proph-black font-semibold py-1 px-4 rounded-xl hover:bg-proph-yellow/90">View Posting</button>
          <button disabled={loading} onClick={handleRemove} className="text-proph-grey-text text-sm hover:underline">Remove</button>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      <WithdrawModal
        open={showWithdrawModal}
        application={application}
        onSubmit={handleWithdrawConfirm}
        onClose={() => setShowWithdrawModal(false)}
      />
    </div>
  );
};


