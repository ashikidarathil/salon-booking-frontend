export enum NotificationType {
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  SYSTEM = 'SYSTEM',
}

export interface INotification {
  id: string;
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FetchNotificationsParams {
  isRead?: boolean;
  limit?: number;
  skip?: number;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: INotification[];
    unreadCount: number;
  };
}
