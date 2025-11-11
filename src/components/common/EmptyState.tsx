import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, ctaText, onCtaClick }) => {
  return (
    <div className="text-center py-12 px-4 bg-proph-grey rounded-xl border border-proph-grey-text/20">
      <div className="flex justify-center mb-3">
        <Icon className="w-10 h-10 text-proph-grey-text" />
      </div>
      <h3 className="text-proph-white font-bold text-lg">{title}</h3>
      {description && <p className="text-sm text-proph-grey-text mt-1">{description}</p>}
      {ctaText && (
        <button onClick={onCtaClick} className="mt-4 bg-proph-yellow text-proph-black font-bold px-4 py-2 rounded-lg">
          {ctaText}
        </button>
      )}
    </div>
  );
};


