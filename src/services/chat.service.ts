import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type {
  ChatRoom,
  ChatMessage,
  ChatUnreadCount,
  ChatMediaUploadResponse,
} from '@/features/chat/chat.types';
import type { ApiResponse } from '@/common/types/api.types';

const ChatService = {
  initializeRoom: async (bookingId: string) => {
    const response = await api.post<ApiResponse<ChatRoom>>(API_ROUTES.CHAT.INITIALIZE, {
      bookingId,
    });
    return response.data.data;
  },

  getUserRooms: async (search?: string) => {
    const response = await api.get<ApiResponse<ChatRoom[]>>(API_ROUTES.CHAT.USER_ROOMS, {
      params: { search },
    });
    return response.data.data;
  },

  getStylistRooms: async (search?: string) => {
    const response = await api.get<ApiResponse<ChatRoom[]>>(API_ROUTES.CHAT.STYLIST_ROOMS, {
      params: { search },
    });
    return response.data.data;
  },

  getAdminRooms: async () => {
    const response = await api.get<ApiResponse<ChatRoom[]>>(API_ROUTES.CHAT.ADMIN_ROOMS);
    return response.data.data;
  },

  getRoomMessages: async (roomId: string, limit = 50, skip = 0) => {
    const response = await api.get<ApiResponse<ChatMessage[]>>(
      API_ROUTES.CHAT.ROOM_MESSAGES(roomId),
      {
        params: { limit, skip },
      },
    );
    return response.data.data;
  },

  markAsRead: async (roomId: string) => {
    await api.patch(API_ROUTES.CHAT.MARK_READ(roomId));
  },

  getUnreadCount: async (roomId: string) => {
    const response = await api.get<ApiResponse<ChatUnreadCount>>(
      API_ROUTES.CHAT.UNREAD_COUNT(roomId),
    );
    return response.data.data.count;
  },

  getTotalUnreadCount: async () => {
    const response = await api.get<ApiResponse<ChatUnreadCount>>(API_ROUTES.CHAT.TOTAL_UNREAD, {
      params: { _t: Date.now() },
    });
    return response.data.data.count;
  },

  uploadMedia: async (roomId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    const response = await api.post<ApiResponse<ChatMediaUploadResponse>>(
      API_ROUTES.CHAT.UPLOAD,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data.data.mediaUrl;
  },
};

export default ChatService;
