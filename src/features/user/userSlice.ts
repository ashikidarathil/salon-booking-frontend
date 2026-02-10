import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, toggleBlockUser } from './userThunks';
import type { UserState } from './user.types';

const initialState: UserState = {
  users: [],
  pagination: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUsers: (state) => {
      state.users = [];
      state.pagination = null;
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
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload.userId);
        if (user) {
          user.isBlocked = action.payload.isBlocked;
        }
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
