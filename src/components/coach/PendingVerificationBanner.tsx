import React from 'react';
import { Clock, CheckCircle, X } from 'lucide-react';

interface PendingVerificationBannerProps {
  onDismiss?: () => void;
}

export const PendingVerificationBanner: React.FC<PendingVerificationBannerProps> = ({
  onDismiss,
}) => {
  const [dismissed, setDismissed] = React.useState(
    localStorage.getItem('verificationBannerDismissed') === 'true'
  );

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('verificationBannerDismissed', 'true');
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div className="bg-proph-yellow/10 border border-proph-yellow rounded-xl p-4 md:p-6 mb-6 relative max-w-[600px] mx-auto">
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-proph-yellow/20 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-proph-grey-text hover:text-proph-white" />
        </button>
      )}
      
      <div className="flex items-start gap-3 md:gap-4">
        <Clock className="w-6 h-6 md:w-7 md:h-7 text-proph-yellow flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold text-proph-white mb-1 text-base md:text-lg">
            Verification in Progress
          </h4>
          <p className="text-proph-grey-text text-sm md:text-base mb-3">
            We're reviewing your account (usually 24-48 hours). You'll receive 
            an email when approved. In the meantime, you can:
          </p>
          <ul className="text-proph-white text-sm md:text-base space-y-1 mb-3">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-proph-yellow" />
              Browse player profiles
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-proph-yellow" />
              Search for prospects
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-proph-yellow" />
              Save players to lists
            </li>
          </ul>
          <p className="text-proph-grey-text text-xs md:text-sm">
            You'll be able to create postings and message players once verified.
          </p>
        </div>
      </div>
    </div>
  );
};

