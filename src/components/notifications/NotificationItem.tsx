import React from 'react';
import { CheckCircle, XCircle, MessageCircle, Eye, Share2, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import type { Notification } from '../../api/notifications';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  const iconProps = { className: "w-5 h-5" };
  
  switch (type) {
    case 'application_accepted':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />;
    case 'application_rejected':
      return <XCircle {...iconProps} className="w-5 h-5 text-proph-grey-text" />;
    case 'new_message':
      return <MessageCircle {...iconProps} className="w-5 h-5 text-proph-yellow" />;
    case 'profile_viewed':
    case 'profile_modal_opened':
      return <Eye {...iconProps} className="w-5 h-5 text-proph-grey-text" />;
    case 'card_shared':
      return <Share2 {...iconProps} className="w-5 h-5 text-proph-purple" />;
    default:
      return <Bell {...iconProps} className="w-5 h-5 text-proph-grey-text" />;
  }
};

const formatTimestamp = (timestamp: string | undefined | null): string => {
  if (!timestamp) return 'Recently';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Recently';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onRead, 
  onClose 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = async () => {
    // Mark as read
    if (!notification.is_read) {
      await onRead(notification.id);
    }
    
    // Navigate to link if provided and not pointing to current user's profile
    if (notification.link) {
      // Don't navigate if link points to current user's profile (e.g., /profile/32 where 32 is current user ID)
      if (user && notification.link.includes(`/profile/${user.id}`)) {
        // Just close dropdown, don't navigate
        onClose();
        return;
      }
      
      // Handle both relative and absolute URLs
      if (notification.link.startsWith('http')) {
        window.location.href = notification.link;
      } else {
        navigate(notification.link);
      }
    }
    
    // Close dropdown
    onClose();
  };

  // Handle dismiss without navigating
  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleClick
    
    if (!notification.is_read) {
      await onRead(notification.id);
    }
  };

  return (
    <div
      className={`
        relative flex gap-3 p-4 transition-colors rounded-lg
        ${!notification.is_read ? 'bg-proph-black' : 'bg-transparent'}
      `}
    >
      {/* Main clickable area */}
      <div 
        className="flex-1 flex gap-3 min-w-0 cursor-pointer hover:bg-proph-grey-light rounded-lg -m-1 p-1"
        onClick={handleClick}
      >
        {/* Unread indicator dot */}
        <div className="flex-shrink-0 pt-1">
          {!notification.is_read && (
            <div className="w-2 h-2 rounded-full bg-proph-yellow" />
          )}
        </div>
        
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-proph-grey flex items-center justify-center">
            {getNotificationIcon(notification.event_type)}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm mb-1 ${!notification.is_read ? 'font-semibold text-proph-white' : 'text-proph-grey-text'}`}>
            {notification.event_description}
          </p>
          <p className="text-xs text-proph-grey-text">
            {formatTimestamp(notification.event_time || notification.created_at)}
          </p>
        </div>
      </div>

      {/* Dismiss button (X) - only show if unread */}
      {!notification.is_read && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-proph-grey rounded-lg transition-colors group ml-2"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4 text-proph-grey-text group-hover:text-proph-white" />
        </button>
      )}
    </div>
  );
};

