// frontend/src/features/user/userThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { userService } from '@/services/user.service';

export const fetchUsers = createAsyncThunk('user/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await userService.getAllUsers();
    return res.data.data.users;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load users');
    }
    return rejectWithValue('Failed to load users');
  }
});

export const toggleBlockUser = createAsyncThunk(
  'user/toggleBlock',
  async ({ userId, block }: { userId: string; block: boolean }, { rejectWithValue }) => {
    try {
      await userService.toggleBlock(userId, block);
      return { userId, isBlocked: block };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update user');
      }
      return rejectWithValue('Failed to update user');
    }
  },
);
