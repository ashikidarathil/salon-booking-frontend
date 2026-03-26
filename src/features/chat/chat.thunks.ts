import { createAsyncThunk } from '@reduxjs/toolkit';
import ChatService from '../../services/chat.service';
import { handleThunkError } from '../../common/utils/thunk.utils';
import type { ChatRoom, ChatMessage } from './chat.types';
import { CHAT_MESSAGES, CHAT_LIMITS } from './chat.constants';

export const fetchUserRooms = createAsyncThunk<
  ChatRoom[],
  string | undefined,
  { rejectValue: string }
>('chat/fetchUserRooms', async (search, { rejectWithValue }) => {
  try {
    return await ChatService.getUserRooms(search);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.FETCH_ROOMS_ERROR);
  }
});

export const fetchStylistRooms = createAsyncThunk<
  ChatRoom[],
  string | undefined,
  { rejectValue: string }
>('chat/fetchStylistRooms', async (search, { rejectWithValue }) => {
  try {
    return await ChatService.getStylistRooms(search);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.FETCH_ROOMS_ERROR);
  }
});

export const fetchRoomMessages = createAsyncThunk<
  { roomId: string; messages: ChatMessage[] },
  { roomId: string; limit?: number; skip?: number },
  { rejectValue: string }
>(
  'chat/fetchRoomMessages',
  async ({ roomId, limit = CHAT_LIMITS.DEFAULT_MESSAGES_LIMIT, skip = 0 }, { rejectWithValue }) => {
    try {
      const messages = await ChatService.getRoomMessages(roomId, limit, skip);
      return { roomId, messages };
    } catch (error) {
      return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.FETCH_MESSAGES_ERROR);
    }
  },
);

export const markRoomMessagesAsRead = createAsyncThunk<void, string, { rejectValue: string }>(
  'chat/markRoomMessagesAsRead',
  async (roomId, { rejectWithValue }) => {
    try {
      await ChatService.markAsRead(roomId);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.MARK_READ_ERROR);
    }
  },
);

export const fetchTotalUnreadCount = createAsyncThunk<number, void, { rejectValue: string }>(
  'chat/fetchTotalUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await ChatService.getTotalUnreadCount();
    } catch (error) {
      return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.FETCH_TOTAL_UNREAD_COUNT_ERROR);
    }
  },
);

export const uploadChatMedia = createAsyncThunk<
  string,
  { roomId: string; file: File },
  { rejectValue: string }
>('chat/uploadMedia', async ({ roomId, file }, { rejectWithValue }) => {
  try {
    return await ChatService.uploadMedia(roomId, file);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.UPLOAD_ERROR);
  }
});

export const initializeChatRoom = createAsyncThunk<ChatRoom, string, { rejectValue: string }>(
  'chat/initializeChatRoom',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await ChatService.initializeRoom(bookingId);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.INITIALIZE_ERROR);
    }
  },
);
