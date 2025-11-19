import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Posting } from '../../types';
import { X, Loader2 } from 'lucide-react';
import * as applicationsService from '../../api/applications';
import { useNotification } from '../../hooks';

interface Props { 
  open: boolean; 
  posting: Posting; 
  onSuccess?: () => void | Promise<void>; // Callback after successful submission
  onClose: () => void; 
}

export const ApplyModalMinC: React.FC<Props> = ({ open, posting, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => { 
    if (open) { 
      const o = document.body.style.overflow; 
      document.body.style.overflow = 'hidden'; 
      return () => { document.body.style.overflow = o; }; 
    } 
  }, [open]);
  
  // Reset message and error when modal closes
  useEffect(() => {
    if (!open) {
      setMessage('');
      setError(null);
    }
  }, [open]);

  const charCount = useMemo(() => message.length, [message]);
  
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => { 
    if (e.target === e.currentTarget && !submitting) onClose(); 
  };
  
  const handleSubmit = async () => { 
    if (submitting) return; 
    
    try { 
      setSubmitting(true);
      setError(null);
      
      // Call API to submit application
      await applicationsService.applyToPosting(posting.id, message);
      
      // Reset message after successful submission
      setMessage('');
      
      // Call success callback (e.g., to refresh postings)
      if (onSuccess) {
        await onSuccess();
      }
      
      // Close modal
      onClose();
      
      // Show success notification
      showNotification('Application submitted successfully!', 'success');
    } catch (err: any) {
      console.error('Error submitting application:', err);
      const errorMessage = err.message || 'Failed to submit application';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally { 
      setSubmitting(false); 
    } 
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="w-full max-w-md animate-slide-up" style={{ height: '50vh' }}>
          <div className="flex h-full flex-col bg-proph-grey rounded-t-2xl overflow-hidden border-t border-proph-grey-text/10">
            {/* Header - logo left, info right */}
            <div className="p-4 bg-proph-grey border-b border-proph-grey-text/10 relative">
              <button onClick={onClose} className="absolute right-3 top-3 p-2 rounded-lg hover:bg-proph-grey-light"><X className="w-5 h-5 text-proph-white" /></button>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={posting.school.logo || '/defualt.webp'} 
                    alt={posting.school.name} 
                    className="w-full h-full object-contain p-1" 
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-proph-white font-bold truncate">{posting.position}</p>
                  <p className="text-sm text-proph-white truncate">{posting.school.name}</p>
                  <p className="text-xs text-proph-grey-text truncate">
                    {posting.school.division}
                    {posting.school.conference && (
                      <>
                        <span className="text-proph-grey-text">{' • '}</span>
                        <span>{posting.school.conference}</span>
                      </>
                    )}
                  </p>
                  <button 
                    className="mt-1 text-xs text-proph-purple hover:underline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/posting/${posting.id}`);
                      onClose();
                    }}
                  >
                    View full posting
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {posting.is_general ? (
                  <p className="text-proph-grey-text text-sm mb-3">
                    You're applying to the general interest posting for {posting.school.name}. 
                    The coaching staff will review your full profile and reach out if there's 
                    a potential fit for their program.
                  </p>
                ) : (
                  <p className="text-proph-grey-text text-sm mb-3">
                    You're applying for the {posting.position} position at {posting.school.name}.
                  </p>
                )}
                <textarea 
                  value={message} 
                  onChange={(e) => { if (e.target.value.length <= 250) setMessage(e.target.value); }} 
                  placeholder="Add a brief note (optional)" 
                  className="w-full min-h-20 bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white placeholder-proph-grey-text outline-none focus:border-proph-purple/40" 
                />
                <div className="text-right text-xs text-proph-grey-text">{charCount}/250</div>
                {error && (
                  <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-2">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-proph-grey p-4 pt-2">
              <button disabled={submitting} onClick={handleSubmit} className={`w-full bg-proph-yellow text-proph-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 ${submitting ? 'opacity-80' : ''}`}>{submitting && <Loader2 className="w-5 h-5 animate-spin" />}Submit Application</button>
              <p className="text-xs text-proph-grey-text text-center mt-2">You can withdraw your application anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


