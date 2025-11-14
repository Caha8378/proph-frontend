// Export all API services
export * from './auth';
export * from './players';
export * from './coaches';
export * from './postings';
export * from './applications';
export * from './messages';
// Export notifications explicitly to avoid getUnreadCount conflict with messages
export {
  getUnreadNotificationCount,
  hasUnread,
  getNotifications,
  markAsRead,
  markAllAsRead,
  trackEvent
} from './notifications';
export type { Notification, TrackEventData } from './notifications';
export { default as apiClient } from './client';

