import React, { useState, useEffect, useRef } from 'react';
import { X, Bell } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { getNotifications, markAllAsRead, dismissNotification, clearAllNotifications } from '../../api/notifications';
import type { Notification } from '../../api/notifications';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: () => void; // Callback to refresh badge count
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ 
  isOpen, 
  onClose,
  onCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissingIds, setDismissingIds] = useState<Set<number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAndMarkAsRead();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const fetchAndMarkAsRead = async () => {
    setLoading(true);
    try {
      // Fetch notifications
      const data = await getNotifications();
      setNotifications(data);
      
      // Auto-mark all as read when modal opens
      if (data.length > 0) {
        try {
          await markAllAsRead();
          // Update local state to mark all as read
          setNotifications(prev => 
            prev.map(n => ({ ...n, is_read: true }))
          );
          // Clear unread badge count
          if (onCountChange) {
            onCountChange();
          }
        } catch (error) {
          console.error('Error marking all as read:', error);
          // Continue even if marking as read fails
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id: number) => {
    // Optimistic update - mark as dismissing for animation
    setDismissingIds(prev => new Set(prev).add(id));
    
    // Remove from UI after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDismissingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300); // Match animation duration
    
    try {
      await dismissNotification(id);
      // Refresh badge count
      if (onCountChange) {
        onCountChange();
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
      // Revert optimistic update on error
      setDismissingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      // Refetch to get accurate state
      fetchAndMarkAsRead();
    }
  };

  const handleClearAll = async () => {
    // Confirmation prompt
    const confirmed = window.confirm('Clear all notifications?');
    if (!confirmed) return;
    
    // Optimistic update
    const previousNotifications = notifications;
    setNotifications([]);
    
    try {
      const response = await clearAllNotifications();
      console.log(`Cleared ${response.dismissed_count} notifications`);
      // Refresh badge count
      if (onCountChange) {
        onCountChange();
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      // Revert on error
      setNotifications(previousNotifications);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:relative md:inset-auto md:z-50">
      {/* Mobile backdrop */}
      <div className="fixed inset-0 bg-black/50 md:hidden" onClick={onClose} />
      
      {/* Dropdown content */}
      <div
        ref={dropdownRef}
        className="
          fixed left-0 right-0 md:absolute md:top-full md:right-0 md:left-auto
          bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-auto
          md:mt-2 md:w-96 
          bg-proph-grey rounded-t-2xl md:rounded-2xl 
          shadow-2xl max-h-[calc(80vh-3.5rem-env(safe-area-inset-bottom))] md:max-h-[600px]
          flex flex-col border border-proph-grey-text/20
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-proph-grey-text/20 flex-shrink-0">
          <h3 className="text-lg font-bold text-proph-white">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-proph-grey-light rounded-lg transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5 text-proph-grey-text" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-proph-yellow border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="w-16 h-16 text-proph-grey-text mb-4" />
              <p className="text-lg font-semibold text-proph-white mb-1">No notifications</p>
              <p className="text-sm text-proph-grey-text">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="divide-y divide-proph-grey-text/10">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`
                    transition-all duration-300 ease-in-out
                    ${dismissingIds.has(notification.id) 
                      ? 'opacity-0 translate-x-full max-h-0 overflow-hidden' 
                      : 'opacity-100 translate-x-0 max-h-96'
                    }
                  `}
                >
                  <NotificationItem
                    notification={notification}
                    onDismiss={handleDismiss}
                    onClose={onClose}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-proph-grey-text/20 bg-proph-grey flex-shrink-0">
          {notifications.length > 0 ? (
            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 bg-transparent border border-proph-error text-proph-error font-semibold rounded-lg hover:bg-proph-error/10 transition-colors active:scale-95"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-proph-yellow text-proph-black font-bold rounded-lg hover:bg-proph-yellow/90 transition-colors active:scale-95"
              >
                Close
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-proph-yellow text-proph-black font-bold rounded-lg hover:bg-proph-yellow/90 transition-colors active:scale-95"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

