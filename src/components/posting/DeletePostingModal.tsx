import React, { useEffect, useState } from 'react';
import type { Posting } from '../../types';
import { X, Loader2, Trash2 } from 'lucide-react';
import { useNotification } from '../../hooks';

interface DeletePostingModalProps {
  open: boolean;
  posting: Posting;
  onSubmit: () => Promise<void> | void;
  onClose: () => void;
}

export const DeletePostingModal: React.FC<DeletePostingModalProps> = ({ 
  open, 
  posting, 
  onSubmit, 
  onClose 
}) => {
  const { showNotification } = useNotification();
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
      showNotification('Posting deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting posting:', err);
      showNotification(err.message || 'Failed to delete posting', 'error');
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
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-proph-black/40 flex items-center justify-center flex-shrink-0">
                  {posting.school.logo ? (
                    <img 
                      src={posting.school.logo} 
                      alt={posting.school.name} 
                      className="w-full h-full object-contain p-1.5" 
                    />
                  ) : (
                    <Trash2 className="w-6 h-6 text-proph-grey-text" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-proph-white font-bold truncate">
                    Delete {posting.position}?
                  </p>
                  <p className="text-proph-grey-text text-sm truncate">
                    {posting.school.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-proph-white text-sm leading-relaxed">
                This will permanently delete this posting and all {posting.applicantCount || 0} associated application{posting.applicantCount !== 1 ? 's' : ''}. This action cannot be undone.
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
                Confirm Delete
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

