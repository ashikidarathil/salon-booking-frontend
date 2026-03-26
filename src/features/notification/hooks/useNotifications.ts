import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addNotification } from '@/features/notification/state/notification.slice';
import { fetchNotifications } from '@/features/notification/state/notification.thunks';
import { fetchTotalUnreadCount } from '@/features/chat/chat.thunks';
import type { INotification } from '@/features/notification/types/notification.types';
import { SOCKET_BASE_URL } from '@/services/api/api';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial notifications
    dispatch(fetchNotifications({}));

    // Connect socket for real-time notifications
    const s = io(SOCKET_BASE_URL, {
      query: { userId: user.id },
      withCredentials: true,
    });

    socketRef.current = s;

    s.on('new_notification', (notification: INotification) => {
      dispatch(addNotification(notification));

      if (notification.type === 'CHAT_MESSAGE') {
        setTimeout(() => {
          dispatch(fetchTotalUnreadCount());
        }, 500);
      }

      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(notification.title, {
          body: notification.message,
        });
      }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, dispatch]);

  return {};
};
