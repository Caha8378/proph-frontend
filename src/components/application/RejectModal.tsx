import React, { useEffect, useState } from 'react';
import type { Application } from '../../types';
import { X, Loader2 } from 'lucide-react';
import { useNotification } from '../../hooks';

interface RejectModalProps {
  open: boolean;
  application: Application;
  onSubmit: () => Promise<void> | void;
  onClose: () => void;
}

export const RejectModal: React.FC<RejectModalProps> = ({ 
  open, 
  application, 
  onSubmit, 
  onClose 
}) => {
  const { showNotification } = useNotification();
  const { player } = application;
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const o = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = o;
      };
    }
  }, [open]);

  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await onSubmit();
      showNotification('Application rejected', 'info');
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      showNotification(err.message || 'Failed to reject application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="w-full max-w-md animate-slide-up" style={{ height: 'auto', maxHeight: '50vh' }}>
          <div className="flex flex-col bg-proph-grey rounded-t-2xl overflow-hidden border-t border-proph-grey-text/10">
            {/* Header */}
            <div className="p-4 bg-proph-grey border-b border-proph-grey-text/10 relative">
              <button 
                onClick={onClose} 
                className="absolute right-3 top-3 p-2 rounded-lg hover:bg-proph-grey-light"
                disabled={submitting}
              >
                <X className="w-5 h-5 text-proph-white" />
              </button>
              <div className="flex items-center gap-3 pr-8">
                <img 
                  src={player.photo} 
                  alt={player.name} 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <div className="min-w-0">
                  <p className="text-proph-white font-bold truncate">
                    Pass on {player.name}?
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-proph-white text-sm leading-relaxed">
                This will notify {player.name} that you're not moving forward. They'll be encouraged to apply elsewhere.
              </p>
            </div>

            <div className="bg-proph-grey p-4 space-y-2">
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className={`w-full bg-proph-error text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-proph-error/90'
                }`}
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Confirm Reject
              </button>
              <button
                disabled={submitting}
                onClick={onClose}
                className="w-full border-2 border-proph-grey-text text-proph-white font-semibold py-3 rounded-xl hover:bg-proph-grey-light transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

