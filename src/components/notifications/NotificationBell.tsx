import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadNotificationCount } from '../../api/notifications';

interface NotificationBellProps {
  onClick: () => void;
}

// Export the ref type so parent can use it
export interface NotificationBellRef {
  refreshCount: () => void;
}

export const NotificationBell = forwardRef<NotificationBellRef, NotificationBellProps>(
  ({ onClick }, ref) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Expose refresh method to parent via ref
    useImperativeHandle(ref, () => ({
      refreshCount: fetchUnreadCount
    }));

    useEffect(() => {
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }, []);

    return (
      <button
        onClick={onClick}
        className="relative p-2 rounded-lg hover:bg-proph-grey-light transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 text-proph-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-proph-yellow text-proph-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }
);

NotificationBell.displayName = 'NotificationBell';

