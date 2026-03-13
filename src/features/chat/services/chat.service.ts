import { api } from '../../../services/api/api';
import { API_ROUTES } from '../../../common/constants/api.routes';
import type { ChatRoom, ChatMessage } from '../types/chat.types';

class ChatApiService {
  async initializeRoom(bookingId: string): Promise<ChatRoom> {
    const response = await api.post<{ data: ChatRoom }>(API_ROUTES.CHAT.INITIALIZE, { bookingId });
    return response.data.data;
  }

  async getUserRooms(): Promise<ChatRoom[]> {
    const response = await api.get<{ data: ChatRoom[] }>(API_ROUTES.CHAT.USER_ROOMS);
    return response.data.data;
  }

  async getStylistRooms(): Promise<ChatRoom[]> {
    const response = await api.get<{ data: ChatRoom[] }>(API_ROUTES.CHAT.STYLIST_ROOMS);
    return response.data.data;
  }

  async getAdminRooms(): Promise<ChatRoom[]> {
    const response = await api.get<{ data: ChatRoom[] }>(API_ROUTES.CHAT.ADMIN_ROOMS);
    return response.data.data;
  }

  async getRoomMessages(roomId: string, limit = 50, skip = 0): Promise<ChatMessage[]> {
    const response = await api.get<{ data: ChatMessage[] }>(API_ROUTES.CHAT.ROOM_MESSAGES(roomId), {
      params: { limit, skip },
    });
    return response.data.data;
  }

  async markAsRead(roomId: string): Promise<void> {
    await api.patch(API_ROUTES.CHAT.MARK_READ(roomId));
  }

  async getUnreadCount(roomId: string): Promise<number> {
    const response = await api.get<{ data: { count: number } }>(API_ROUTES.CHAT.UNREAD_COUNT(roomId));
    return response.data.data.count;
  }

  async uploadMedia(roomId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    const response = await api.post<{ data: { mediaUrl: string } }>(API_ROUTES.CHAT.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.mediaUrl;
  }
}

export const chatApiService = new ChatApiService();
