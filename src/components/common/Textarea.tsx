import React from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  showCount,
  maxLength,
  value,
  className,
  ...props
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-proph-text mb-2">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          'w-full bg-proph-surface border rounded-lg px-4 py-3 text-proph-text placeholder-proph-violet resize-none',
          'focus:outline-none focus:ring-2 transition-all duration-150',
          error 
            ? 'border-proph-error focus:border-proph-error focus:ring-proph-error/20'
            : 'border-proph-violet/40 focus:border-proph-yellow focus:ring-proph-yellow/20',
          className
        )}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        {error ? (
          <p className="text-sm text-proph-error">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-proph-violet">{helperText}</p>
        ) : (
          <span />
        )}
        {showCount && maxLength && (
          <p className="text-xs text-proph-violet">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};
