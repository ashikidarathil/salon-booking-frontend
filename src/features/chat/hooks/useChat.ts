import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addMessageToRoom, updateRoomLastMessage, incrementUnreadCount } from '../chat.slice';
import { type ChatMessage, type SendMessagePayload, MessageType } from '../chat.types';
import { showError } from '../../../common/utils/swal.utils';
import { SOCKET_BASE_URL } from '../../../services/api/api';

export const useChat = (userId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_BASE_URL, {
      query: { userId },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('newMessage', (message: ChatMessage) => {
      dispatch(addMessageToRoom(message));

      if (message.senderId !== userId) {
        dispatch(incrementUnreadCount());
      }

      const isMe = message.senderId === userId;
      const prefix = isMe ? 'You: ' : '';

      let preview = 'New message';
      if (message.messageType === MessageType.TEXT) preview = message.content || 'Text message';
      else if (message.messageType === MessageType.IMAGE) preview = '📷 Image';
      else if (message.messageType === MessageType.VOICE) preview = '🎤 Voice message';
      else if (message.messageType === MessageType.SYSTEM)
        preview = message.content || 'System message';

      dispatch(
        updateRoomLastMessage({
          roomId: message.chatRoomId,
          lastMessage: `${prefix}${preview}`,
          lastMessageType: message.messageType,
          lastMessageAt: message.createdAt,
          incrementUnread: message.senderId !== userId,
        }),
      );
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('error', (err: { message: string }) => {
      showError('Chat Error', err?.message || 'Something went wrong with the connection.');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, dispatch]);

  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinChat', roomId);
    }
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveChat', roomId);
    }
  }, []);

  const sendMessage = useCallback((payload: SendMessagePayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', payload);
    } else {
      console.error('Socket not connected');
    }
  }, []);

  return {
    joinRoom,
    leaveRoom,
    sendMessage,
    isConnected,
  };
};
