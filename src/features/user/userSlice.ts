import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, toggleBlockUser } from './userThunks';
import type { UserListItem } from './user.types';

interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UserState {
  data: UserListItem[];
  pagination: PaginationMetadata | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  data: [],
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
      state.data = [];
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
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        const user = state.data.find((u) => u.id === action.payload.userId);
        if (user) {
          user.isBlocked = action.payload.isBlocked;
        }
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
