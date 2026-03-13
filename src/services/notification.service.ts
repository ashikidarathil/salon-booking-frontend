import { api } from './api/api';
import type { NotificationResponse } from '../features/notification/types/notification.types';

export const notificationService = {
  getMyNotifications: async (isRead?: boolean, limit = 20, skip = 0): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>('/notifications', {
      params: { isRead, limit, skip },
    });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
