import apiClient from './client';

export interface Notification {
  id: number;
  receiver_user_id: number;
  actor_user_id?: number;
  event_type: string;
  event_description: string;
  is_read: boolean;
  created_at?: string;
  [key: string]: any;
}

/**
 * Check if player has unread notifications
 */
export const hasUnread = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ hasUnread: boolean }>('/notifications/unread');
    return response.data.hasUnread;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to check unread status');
  }
};

/**
 * Get all notifications for current user
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

/**
 * Mark notification as read (placeholder - needs backend endpoint)
 */
export const markAsRead = async (eventId: number): Promise<void> => {
  try {
    await apiClient.put(`/notifications/${eventId}`, { is_read: true });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

