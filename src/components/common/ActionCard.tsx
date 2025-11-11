import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  countBadge?: string;
  onClick?: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, subtitle, countBadge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-proph-grey rounded-xl p-6 text-left hover:bg-proph-grey-light transition-colors w-full relative"
    >
      {countBadge && (
        <span className="absolute top-3 right-3 bg-proph-yellow text-proph-black text-xs font-bold px-2 py-0.5 rounded-full">
          {countBadge}
        </span>
      )}
      <Icon className="w-6 h-6 text-proph-white mb-3" />
      <div className="text-proph-white font-bold">{title}</div>
      {subtitle && <div className="text-sm text-proph-grey-text mt-1">{subtitle}</div>}
    </button>
  );
};


