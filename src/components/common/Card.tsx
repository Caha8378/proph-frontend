import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className,
  hover = false,
  noPadding = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-proph-surface rounded-xl border border-proph-violet/20',
        !noPadding && 'p-4',
        hover && 'hover:border-proph-blue/40 transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
