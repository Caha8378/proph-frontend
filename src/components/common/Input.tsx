import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-proph-text mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full bg-proph-surface border rounded-lg px-4 py-3 text-proph-text placeholder-proph-violet',
          'focus:outline-none focus:ring-2 transition-all duration-150',
          error 
            ? 'border-proph-error focus:border-proph-error focus:ring-proph-error/20'
            : 'border-proph-violet/40 focus:border-proph-yellow focus:ring-proph-yellow/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-proph-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-proph-violet">{helperText}</p>
      )}
    </div>
  );
};
