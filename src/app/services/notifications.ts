/**
 * Notifications Service - User notifications and activity feed
 */

import apiClient from './api-client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

class NotificationsService {
  async getUserNotifications(
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ notifications: Notification[]; total: number; unread_count: number }> {
    return apiClient.request(
      'get',
      `/notifications?limit=${limit}&offset=${offset}`,
    ) as any;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.request('post', `/notifications/${notificationId}/read`, {});
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.request('post', '/notifications/read-all', {});
  }
}

export default new NotificationsService();
