import { createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '@/services/user.service';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import type { PaginatedUsersResponse } from '@/services/user.service';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const toggleBlockUser = createAsyncThunk<
  { userId: string; isBlocked: boolean },
  { userId: string; block: boolean },
  { rejectValue: string }
>('user/toggleBlock', async ({ userId, block }, { rejectWithValue }) => {
  try {
    await userService.toggleBlock(userId, block);
    return { userId, isBlocked: block };
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const fetchUsers = createAsyncThunk<
  PaginatedUsersResponse,
  {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isBlocked?: boolean;
    isActive?: boolean;
    role?: string;
  },
  { rejectValue: string }
>('user/fetchUsers', async (query, { rejectWithValue }) => {
  try {
    const res = await userService.getUsers(query);

    if (!res.data.success) {
      return rejectWithValue(ERROR_MESSAGES.DATA_LOAD_FAILED);
    }

    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});
