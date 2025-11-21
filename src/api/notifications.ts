import apiClient from './client';

export interface Notification {
  id: number;
  receiver_user_id?: number;
  actor_user_id?: number;
  actor_name?: string | null;
  event_type: string;
  event_description: string;
  link?: string | null;
  is_read: boolean;
  event_time?: string;
  created_at?: string;
  metadata?: Record<string, any> | null;
  [key: string]: any;
}

/**
 * Get unread notification count for current user
 * Backend endpoint: GET /events/unread-count
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<{ count: number }>('/events/unread-count');
    return response.data.count || 0;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to get unread count');
  }
};


/**
 * Check if player has unread notifications (backward compatibility)
 * Uses getUnreadNotificationCount internally
 */
export const hasUnread = async (): Promise<boolean> => {
  try {
    const count = await getUnreadNotificationCount();
    return count > 0;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to check unread status');
  }
};

/**
 * Get all events/notifications for current user
 * Backend endpoint: GET /events
 * Returns: { success: true, events: Notification[] }
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; events: Notification[] }>('/events');
    return response.data.events || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch notifications');
  }
};

/**
 * Mark a specific event as read
 * Backend endpoint: POST /events/:id/read
 */
export const markAsRead = async (eventId: number): Promise<void> => {
  try {
    await apiClient.post(`/events/${eventId}/read`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to mark notification as read');
  }
};

/**
 * Mark all events as read
 * Backend endpoint: POST /events/read-all
 */
export const markAllAsRead = async (): Promise<void> => {
  try {
    await apiClient.post('/events/read-all');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to mark all notifications as read');
  }
};

/**
 * Dismiss/delete a specific notification
 * Backend endpoint: DELETE /events/:id
 */
export const dismissNotification = async (eventId: number): Promise<void> => {
  try {
    await apiClient.delete(`/events/${eventId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to dismiss notification');
  }
};

/**
 * Clear all notifications
 * Backend endpoint: DELETE /events/clear-all
 * Returns: { success: true, dismissed_count: number }
 */
export interface ClearAllResponse {
  success: boolean;
  dismissed_count: number;
}

export const clearAllNotifications = async (): Promise<ClearAllResponse> => {
  try {
    const response = await apiClient.delete<ClearAllResponse>('/events/clear-all');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to clear all notifications');
  }
};

/**
 * Track frontend-triggered events
 * Backend endpoint: POST /events/track
 * Body: { eventType, targetUserId, metadata }
 */
export interface TrackEventData {
  eventType: 'card_shared' | 'profile_viewed' | 'profile_modal_opened' | 'external_link_clicked';
  targetUserId: string | number;
  metadata?: Record<string, any>;
}

export const trackEvent = async (data: TrackEventData): Promise<void> => {
  try {
    await apiClient.post('/events/track', {
      eventType: data.eventType,
      targetUserId: data.targetUserId,
      metadata: data.metadata || {},
    });
  } catch (error: any) {
    // Silently fail - don't break the UI if tracking fails
    console.error('Failed to track event:', error);
  }
};

