import { api } from '@/services/api/api';
import type { NotificationResponse } from '@/features/notification/types/notification.types';
import { NOTIFICATION_ENDPOINTS } from '@/features/notification/constants/notification.routes';

export const notificationService = {
  getMyNotifications: async (
    isRead?: boolean,
    limit = 20,
    skip = 0,
  ): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>(NOTIFICATION_ENDPOINTS.GET_ALL, {
      params: { isRead, limit, skip },
    });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(NOTIFICATION_ENDPOINTS.MARK_READ(id));
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  },
} as const;
