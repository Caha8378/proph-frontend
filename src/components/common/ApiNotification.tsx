import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface ApiNotificationProps {
  message: string;
  type: NotificationType;
  duration?: number;
  onClose: () => void;
}

export const ApiNotification: React.FC<ApiNotificationProps> = ({
  message,
  type,
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-hide after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white border-l-4 border-black';
      case 'error':
        return 'bg-gradient-to-br from-white to-proph-grey text-red-400 border-l-4 border-proph-purple';
      case 'warning':
        return 'bg-gradient-to-br from-red-500 to-red-600 text-white border-l-4 border-black';
      case 'info':
        return 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-l-4 border-black';
      default:
        return 'bg-proph-grey text-proph-white border-l-4 border-proph-yellow';
    }
  };

  return (
    <div
      className={`
        ${getTypeStyles()}
        px-4 py-1.5 rounded-xl shadow-lg
        w-full max-w-2xl
        transform transition-transform duration-300 ease-out
        ${isVisible ? 'translate-x-0' : 'translate-x-[400px]'}
      `}
    >
      <div className="relative pr-6 flex items-center gap-2">
        <div className="font-bold text-xs whitespace-nowrap">ALERT</div>
        <div className="text-xs opacity-90 flex-1">{message}</div>
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 bg-transparent border-none text-white text-lg cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

