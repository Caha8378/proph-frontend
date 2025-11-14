import React, { useState, useEffect, useRef } from 'react';
import { X, Bell } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notifications';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
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

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      
      // Refresh badge count
      if (onCountChange) {
        onCountChange();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      // Refresh badge count
      if (onCountChange) {
        onCountChange();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="w-12 h-12 text-proph-grey-text mb-3" />
              <p className="text-proph-grey-text text-center">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-proph-grey-text/10">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-proph-grey-text/20 bg-proph-grey flex-shrink-0">
            {unreadCount > 0 ? (
              <button
                onClick={handleMarkAllAsRead}
                className="w-full py-3 bg-proph-yellow text-proph-black font-bold rounded-lg hover:bg-proph-yellow/90 transition-colors active:scale-95"
              >
                Mark All as Read
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3 bg-proph-grey-light text-proph-white font-semibold rounded-lg hover:bg-proph-grey transition-colors"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

