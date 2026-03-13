import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addNotification } from '../state/notification.slice';
import { fetchNotifications } from '../state/notification.thunks';
import type { Notification } from '../types/notification.types';
import { SOCKET_BASE_URL } from '../../../services/api/api';
import { useRef } from 'react';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial notifications
    dispatch(fetchNotifications({}));

    // Connect socket for real-time notifications
    socketRef.current = io(SOCKET_BASE_URL, {
      query: { userId: user.id },
      withCredentials: true,
    });

    socketRef.current.on('new_notification', (notification: Notification) => {
      dispatch(addNotification(notification));
      
      // Optional: Show a browser toast or sound here
      if ('Notification' in window && window.Notification.permission === 'granted') {
          new window.Notification(notification.title, {
              body: notification.message,
          });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?.id, dispatch]);

  return {
    socket: socketRef.current,
  };
};
