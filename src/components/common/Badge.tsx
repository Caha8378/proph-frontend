import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 
  | 'great-fit' 
  | 'good-fit' 
  | 'possible-fit' 
  | 'pending' 
  | 'accepted' 
  | 'rejected'
  | 'active';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase';
  
  const variants = {
    'great-fit': 'bg-proph-yellow text-black',
    'good-fit': 'bg-proph-blue text-black',
    'possible-fit': 'bg-proph-violet text-white',
    'pending': 'bg-proph-yellow/20 text-proph-yellow border border-proph-yellow',
    'accepted': 'bg-proph-success/20 text-proph-success border border-proph-success',
    'rejected': 'bg-proph-error/20 text-proph-error border border-proph-error',
    'active': 'bg-proph-success text-white',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], className)}>
      {children}
    </span>
  );
};
