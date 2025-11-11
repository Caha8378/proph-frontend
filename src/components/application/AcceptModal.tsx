import React, { useEffect, useMemo, useState } from 'react';
import type { Application } from '../../types';
import { X, Loader2 } from 'lucide-react';
import { useNotification } from '../../hooks';

interface AcceptModalProps {
  open: boolean;
  application: Application;
  schoolName?: string; // Optional school name - will use posting.school.name as fallback
  coachName?: string; // Optional coach name for signature
  onSubmit: (message: string) => Promise<void> | void;
  onClose: () => void;
}

export const AcceptModal: React.FC<AcceptModalProps> = ({ 
  open, 
  application, 
  schoolName,
  coachName,
  onSubmit, 
  onClose 
}) => {
  const { showNotification } = useNotification();
  const { player, posting } = application;
  
  // Use provided schoolName, or fallback to posting.school.name, or 'our school'
  const displaySchoolName = schoolName || posting.school.name || 'our school';
  
  // Use provided coachName, or fallback to posting.coachName, or 'Coach'
  const displayCoachName = coachName || posting.coachName || 'Coach';
  
  const getDefaultMessage = () => {
    const positionTitle = posting.position || 'this position';
    return `Hey ${player.name},\n\nWe're interested in having you play ${positionTitle} at ${displaySchoolName}. Let's talk about fit.\n\nYou can message me directly through Proph - check your Recruit tab for our conversation.\n\n- Coach ${displayCoachName}`;
  };

  const [message, setMessage] = useState(getDefaultMessage());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setMessage(getDefaultMessage());
      const o = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = o;
      };
    }
  }, [open, application]);

  if (!open) return null;

  const charCount = useMemo(() => message.length, [message]);
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  const handleSubmit = async () => {
    if (submitting || !message.trim()) return;
    try {
      setSubmitting(true);
      await onSubmit(message.trim());
      showNotification('Application accepted successfully!', 'success');
    } catch (err: any) {
      console.error('Error accepting application:', err);
      showNotification(err.message || 'Failed to accept application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="w-full max-w-md animate-slide-up" style={{ height: '70vh' }}>
          <div className="flex h-full flex-col bg-proph-grey rounded-t-2xl overflow-hidden border-t border-proph-grey-text/10">
            {/* Header */}
            <div className="p-4 bg-proph-grey border-b border-proph-grey-text/10 relative">
              <button 
                onClick={onClose} 
                className="absolute right-3 top-3 p-2 rounded-lg hover:bg-proph-grey-light"
                disabled={submitting}
              >
                <X className="w-5 h-5 text-proph-white" />
              </button>
              <div className="flex items-center gap-3">
                <img 
                  src={player.photo} 
                  alt={player.name} 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <div className="min-w-0 pr-8">
                  <p className="text-proph-white font-bold truncate">
                    Accept {player.name}?
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2 space-y-2 flex-1 overflow-y-auto">
              <p className="text-proph-white text-sm leading-relaxed">
                This will notify {player.name} that you're interested and open direct communication. You can continue the conversation through the Recruit tab in Proph.
              </p>

              <div>
                <label className="block text-sm font-semibold text-proph-white mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setMessage(e.target.value);
                  }}
                  className="w-full min-h-40 bg-proph-black border border-proph-yellow rounded-lg p-1 text-sm text-proph-white placeholder-proph-grey-text outline-none focus:border-proph-purple/40"
                  required
                />
                <div className="text-right text-xs text-proph-grey-text mt-1">{charCount}/500</div>
              </div>
            </div>

            <div className="bg-proph-grey p-4 space-y-2">
              <button
                disabled={submitting || !message.trim()}
                onClick={handleSubmit}
                className={`w-full bg-proph-success text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 ${
                  submitting || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-proph-success/90'
                }`}
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Accept & Send Message
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

