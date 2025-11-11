import React, { useState } from 'react';
import { Modal } from '../layout/Modal';
import { PlayerCardFinal1 as PlayerCard } from '../player/PlayerCardFinal1';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import type { Posting, PlayerProfile } from '../../types';
import { CheckCircle } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  posting: Posting;
  player: PlayerProfile;
  onSubmit: (note?: string) => Promise<void>;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  posting,
  player,
  onSubmit,
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(note || undefined);
      onClose();
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply to ${posting.school.name}`}
      subtitle={`${posting.position} • ${posting.school.division}`}
    >
      <div className="space-y-6">
        {/* Player Card Preview */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <PlayerCard player={player} />
          </div>
          <p className="text-center text-xs text-proph-violet">
            This is what Coach {posting.coachName} will see
          </p>
        </div>

        {/* Optional Note */}
        <div className="space-y-2">
          <Textarea
            label="Add a note (optional)"
            placeholder="Why are you interested in this program?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={150}
            showCount
            helperText="Coaches are 2x more likely to accept applications with a personal note"
            rows={4}
          />
        </div>

        {/* Application Summary */}
        <div className="bg-proph-surface border border-proph-violet/20 rounded-lg p-4 space-y-2">
          <p className="text-sm text-proph-violet font-medium">
            Your application includes:
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-proph-text">
              <CheckCircle className="w-4 h-4 text-proph-success" />
              Player profile
            </div>
            <div className="flex items-center gap-2 text-sm text-proph-text">
              <CheckCircle className="w-4 h-4 text-proph-success" />
              Stats & highlights
            </div>
            <div className="flex items-center gap-2 text-sm text-proph-text">
              <CheckCircle className="w-4 h-4 text-proph-success" />
              Proph evaluation ({player.evaluation.level})
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Application
          </Button>
          <p className="text-center text-xs text-proph-violet">
            You can track this in your Applications tab
          </p>
        </div>
      </div>
    </Modal>
  );
};
