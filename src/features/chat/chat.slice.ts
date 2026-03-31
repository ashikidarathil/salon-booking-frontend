import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatRoom, ChatMessage } from './chat.types';
import {
  fetchUserRooms,
  fetchStylistRooms,
  fetchRoomMessages,
  initializeChatRoom,
  fetchTotalUnreadCount,
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
      action: PayloadAction<{
        roomId: string;
        lastMessage: string;
        lastMessageType?: string;
        lastMessageAt: string;
        incrementUnread?: boolean;
      }>,
    ) => {
      const room = state.rooms.find((r) => r.id === action.payload.roomId);
      if (room) {
        room.lastMessage = action.payload.lastMessage;
        room.lastMessageType = action.payload.lastMessageType;
        room.lastMessageAt = action.payload.lastMessageAt;
        if (action.payload.incrementUnread) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        }
      }
    },
    resetRoomUnreadCount: (state, action: PayloadAction<string>) => {
      const room = state.rooms.find((r) => r.id === action.payload);
      if (room) {
        room.unreadCount = 0;
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
      // Fetch Messages
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
        state.error = (action.payload as string) || null;
      })
      // Initialize Room
      .addCase(initializeChatRoom.fulfilled, (state, action) => {
        const exists = state.rooms.find((r: ChatRoom) => r.id === action.payload.id);
        if (!exists) {
          state.rooms.unshift(action.payload);
        }
      })
      .addCase(fetchTotalUnreadCount.fulfilled, (state, action) => {
        state.totalUnreadCount = action.payload;
      })
      .addMatcher(
        (action) =>
          action.type === fetchUserRooms.pending.type ||
          action.type === fetchStylistRooms.pending.type,
        (state) => {
          state.isLoadingRooms = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type === fetchUserRooms.fulfilled.type ||
          action.type === fetchStylistRooms.fulfilled.type,
        (state, action: PayloadAction<ChatRoom[]>) => {
          state.isLoadingRooms = false;
          state.rooms = action.payload;
        },
      )
      .addMatcher(
        (action) =>
          action.type === fetchUserRooms.rejected.type ||
          action.type === fetchStylistRooms.rejected.type,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoadingRooms = false;
          state.error = action.payload || null;
        },
      );
  },
});

export const {
  setActiveRoom,
  addMessageToRoom,
  updateRoomLastMessage,
  resetRoomUnreadCount,
  clearChatError,
  incrementUnreadCount,
  resetUnreadCount,
  setTotalUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
