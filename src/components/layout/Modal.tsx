import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-h-[60vh]',
    md: 'max-h-[75vh]',
    lg: 'max-h-[90vh]',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
      <div
        className={clsx(
          'w-full bg-proph-bg rounded-t-2xl overflow-y-auto',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-proph-bg border-b border-proph-violet/20 px-6 py-4 flex justify-between items-start">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-proph-text">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-proph-violet mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-proph-surface rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-proph-text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
