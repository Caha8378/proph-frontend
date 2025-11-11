import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Posting, PlayerProfile } from '../../types';
import { X, Loader2 } from 'lucide-react';
import { PlayerCardFinal1 } from '../player/PlayerCardFinal1';

interface ApplyModalProps {
  open: boolean;
  posting: Posting;
  playerProfile: PlayerProfile;
  onSubmit: (message: string) => Promise<void> | void;
  onClose: () => void;
}

export const ApplyModalV1: React.FC<ApplyModalProps> = ({ open, posting, playerProfile, onSubmit, onClose }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  const charCount = useMemo(() => message.length, [message]);

  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await onSubmit(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div
          className="w-full max-w-md translate-y-0 animate-[slideUp_300ms_ease-out]"
          style={{
            height: '90vh',
          }}
        >
          {/* Container */}
          <div className="flex h-full flex-col bg-proph-black rounded-t-2xl overflow-hidden border-t border-proph-grey-text/10">
            {/* Header */}
            <div className="bg-proph-black border-b border-proph-grey-text/10 p-4">
              <div className="flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={posting.school.logo} alt={posting.school.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="text-proph-white font-bold truncate">{posting.school.name}</p>
                    <p className="text-xs text-proph-grey-text truncate">Applying for {posting.position}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-proph-grey-light">
                  <X className="w-5 h-5 text-proph-white" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-proph-grey-text">{posting.school.name} • {posting.school.division}</p>
                <button className="text-xs text-proph-purple hover:underline" onClick={() => window.open('#/posting', '_self')}>View full posting</button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <p className="text-xs text-proph-grey-text mb-2">What coaches will see</p>
                <div className="scale-[0.85] origin-top rounded-xl p-3 bg-proph-black border border-proph-grey-text/20">
                  <PlayerCardFinal1 player={playerProfile} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-proph-white mb-2">Message to coach (optional)</label>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setMessage(e.target.value);
                  }}
                  placeholder="Tell the coach why you're a great fit..."
                  className="w-full min-h-28 bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white placeholder-proph-grey-text outline-none focus:border-proph-purple/40"
                />
                <div className="text-right text-xs text-proph-grey-text mt-1">{charCount}/500</div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-proph-grey border-t border-proph-grey-text/10 p-4">
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className={`w-full bg-proph-yellow text-proph-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 ${submitting ? 'opacity-80' : ''}`}
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Submit Application
              </button>
              <p className="text-xs text-proph-grey-text text-center mt-2">You can withdraw your application anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// keyframes
// Tailwind v4 allows arbitrary keyframes via inline animation name; ensure index.css has nothing conflicting.


