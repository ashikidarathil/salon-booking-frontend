// frontend/src/features/user/userSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, toggleBlockUser } from './userThunks';

interface UserListItem {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
  createdAt: string;
}

interface UserState {
  users: UserListItem[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.userId === action.payload.userId);
        if (user) {
          user.isBlocked = action.payload.isBlocked;
        }
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
