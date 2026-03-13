import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatApiService } from '../services/chat.service';
import { handleThunkError } from '../../../common/utils/thunk.utils';
import type { ChatRoom, ChatMessage } from '../types/chat.types';
import { CHAT_MESSAGES, CHAT_LIMITS } from '../constants/chat.constants';

export const fetchUserRooms = createAsyncThunk<ChatRoom[], void, { rejectValue: string }>(
  'chat/fetchUserRooms',
  async (_, { rejectWithValue }) => {
    try {
      return await chatApiService.getUserRooms();
    } catch (error) {
      return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.FETCH_ROOMS_ERROR);
    }
  },
);

export const fetchStylistRooms = createAsyncThunk<ChatRoom[], void, { rejectValue: string }>(
  'chat/fetchStylistRooms',
  async (_, { rejectWithValue }) => {
    try {
      return await chatApiService.getStylistRooms();
    } catch (error) {
      return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.FETCH_ROOMS_ERROR);
    }
  },
);

export const fetchRoomMessages = createAsyncThunk<
  { roomId: string; messages: ChatMessage[] },
  { roomId: string; limit?: number; skip?: number },
  { rejectValue: string }
>('chat/fetchRoomMessages', async ({ roomId, limit = CHAT_LIMITS.DEFAULT_MESSAGES_LIMIT, skip = 0 }, { rejectWithValue }) => {
  try {
    const messages = await chatApiService.getRoomMessages(roomId, limit, skip);
    return { roomId, messages };
  } catch (error) {
    return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.FETCH_MESSAGES_ERROR);
  }
});

export const markRoomMessagesAsRead = createAsyncThunk<void, string, { rejectValue: string }>(
  'chat/markRoomMessagesAsRead',
  async (roomId, { rejectWithValue }) => {
    try {
      await chatApiService.markAsRead(roomId);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.MARK_READ_ERROR);
    }
  },
);

export const uploadChatMedia = createAsyncThunk<
  string,
  { roomId: string; file: File },
  { rejectValue: string }
>('chat/uploadMedia', async ({ roomId, file }, { rejectWithValue }) => {
  try {
    return await chatApiService.uploadMedia(roomId, file);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.UPLOAD_ERROR);
  }
});

export const initializeChatRoom = createAsyncThunk<ChatRoom, string, { rejectValue: string }>(
  'chat/initializeChatRoom',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await chatApiService.initializeRoom(bookingId);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, CHAT_MESSAGES.INITIALIZE_ERROR);
    }
  },
);
