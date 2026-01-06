// frontend/src/features/stylistInvite/stylistInviteThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { stylistInviteService } from '@/services/stylistInvite.service';
import type { StylistListItem } from '@/services/stylistInvite.service';

export type InvitePreview = {
  email: string;
  branchId?: string;
  specialization: string;
  experience: number;
  expiresAt: string;
};

export const createStylistInvite = createAsyncThunk<
  { inviteLink: string; userId: string },
  { email: string; branchId?: string; specialization: string; experience: number },
  { rejectValue: string }
>('stylistInvite/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.createInvite(payload);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to send invite');
    }
    return rejectWithValue('Failed to send invite');
  }
});

export const applyAsStylist = createAsyncThunk<
  { message: string },
  { email: string; specialization: string; experience: number },
  { rejectValue: string }
>('auth/applyAsStylist', async (payload, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.applyAsStylist(payload);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Application failed');
    }
    return rejectWithValue('Network error');
  }
});

export const validateInvite = createAsyncThunk<
  InvitePreview,
  { token: string },
  { rejectValue: string }
>('stylistInvite/validate', async ({ token }, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.validate(token);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Invalid invite');
    }
    return rejectWithValue('Invalid invite');
  }
});

export const acceptInvite = createAsyncThunk<
  { success: true },
  { token: string; name: string; phone?: string; password: string },
  { rejectValue: string }
>('stylistInvite/accept', async ({ token, ...data }, { rejectWithValue }) => {
  try {
    await stylistInviteService.accept(token, data);
    return { success: true };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to accept invite');
    }
    return rejectWithValue('Failed to accept invite');
  }
});

export const fetchStylists = createAsyncThunk<StylistListItem[], void, { rejectValue: string }>(
  'stylistInvite/fetchStylists',
  async (_, { rejectWithValue }) => {
    try {
      const res = await stylistInviteService.listStylists();
      return res.data.data as StylistListItem[];
    } catch (err: unknown) {
      console.error('fetchStylists error:', err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch stylists';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const approveStylist = createAsyncThunk<
  { success: true },
  { userId: string },
  { rejectValue: string }
>('stylistInvite/approveStylist', async ({ userId }, { rejectWithValue }) => {
  try {
    await stylistInviteService.approve(userId);
    return { success: true };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to approve');
    }
    return rejectWithValue('Failed to approve');
  }
});

export const rejectStylist = createAsyncThunk<
  { success: true },
  { userId: string },
  { rejectValue: string }
>('stylistInvite/rejectStylist', async ({ userId }, { rejectWithValue }) => {
  try {
    await stylistInviteService.reject(userId);
    return { success: true };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to reject');
    }
    return rejectWithValue('Failed to reject');
  }
});

export const sendInviteToApplied = createAsyncThunk<
  { inviteLink: string },
  { userId: string },
  { rejectValue: string }
>('stylistInvite/sendInviteToApplied', async ({ userId }, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.sendInviteToApplied(userId);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('Send invite error details:', err.response?.data);
      return rejectWithValue(err.response?.data?.message ?? 'Failed to send invite');
    }
    return rejectWithValue('Failed to send invite');
  }
});

export const toggleBlockStylist = createAsyncThunk<
  { success: true; userId: string; block: boolean },
  { userId: string; block: boolean },
  { rejectValue: string }
>('stylistInvite/toggleBlockStylist', async ({ userId, block }, { rejectWithValue }) => {
  try {
    await stylistInviteService.toggleBlock(userId, block);
    return { success: true, userId, block };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to toggle block');
    }
    return rejectWithValue('Failed to toggle block');
  }
});
