import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatRoom, ChatMessage } from '../types/chat.types';
import {
  fetchUserRooms,
  fetchStylistRooms,
  fetchRoomMessages,
  initializeChatRoom,
} from './chat.thunks';

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messagesByRoom: Record<string, ChatMessage[]>;
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  totalUnreadCount: number;
}

const initialState: ChatState = {
  rooms: [],
  activeRoomId: null,
  messagesByRoom: {},
  isLoadingRooms: false,
  isLoadingMessages: false,
  error: null,
  totalUnreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<string | null>) => {
      state.activeRoomId = action.payload;
    },
    addMessageToRoom: (state, action: PayloadAction<ChatMessage>) => {
      const { chatRoomId } = action.payload;
      if (!state.messagesByRoom[chatRoomId]) {
        state.messagesByRoom[chatRoomId] = [];
      }
      
      const exists = state.messagesByRoom[chatRoomId].some((m) => m.id === action.payload.id);
      if (!exists) {
        state.messagesByRoom[chatRoomId].push(action.payload);
      }
    },
    updateRoomLastMessage: (
      state,
      action: PayloadAction<{ roomId: string; lastMessage: string; lastMessageAt: string }>
    ) => {
      const room = state.rooms.find((r) => r.id === action.payload.roomId);
      if (room) {
        room.lastMessage = action.payload.lastMessage;
        room.lastMessageAt = action.payload.lastMessageAt;
      }
    },
    clearChatError: (state) => {
      state.error = null;
    },
    incrementUnreadCount: (state) => {
      state.totalUnreadCount += 1;
    },
    resetUnreadCount: (state) => {
      state.totalUnreadCount = 0;
    },
    setTotalUnreadCount: (state, action: PayloadAction<number>) => {
      state.totalUnreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRooms.pending, (state) => {
        state.isLoadingRooms = true;
        state.error = null;
      })
      .addCase(fetchUserRooms.fulfilled, (state, action) => {
        state.isLoadingRooms = false;
        state.rooms = action.payload;
      })
      .addCase(fetchUserRooms.rejected, (state, action) => {
        state.isLoadingRooms = false;
        state.error = action.payload || null;
      })

      .addCase(fetchStylistRooms.pending, (state) => {
        state.isLoadingRooms = true;
        state.error = null;
      })
      .addCase(fetchStylistRooms.fulfilled, (state, action) => {
        state.isLoadingRooms = false;
        state.rooms = action.payload;
      })
      .addCase(fetchStylistRooms.rejected, (state, action) => {
        state.isLoadingRooms = false;
        state.error = action.payload || null;
      })

      .addCase(fetchRoomMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchRoomMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        state.messagesByRoom[action.payload.roomId] = action.payload.messages;
      })
      .addCase(fetchRoomMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload || null;
      })

      .addCase(initializeChatRoom.fulfilled, (state, action) => {
        const exists = state.rooms.find((r) => r.id === action.payload.id);
        if (!exists) {
          state.rooms.unshift(action.payload);
        }
      });
  },
});

export const {
  setActiveRoom,
  addMessageToRoom,
  updateRoomLastMessage,
  clearChatError,
  incrementUnreadCount,
  resetUnreadCount,
  setTotalUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
