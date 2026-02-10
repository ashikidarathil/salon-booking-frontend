import { createAsyncThunk } from '@reduxjs/toolkit';
import { stylistInviteService } from '@/services/stylistInvite.service';
import type { StylistListItem, InvitePreview, PaginatedStylistResponse } from './stylistInvite.types';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import type { SuccessMessageResponse, SuccessResponse } from '@/common/types/api.types';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const createStylistInvite = createAsyncThunk<
  { inviteLink: string; userId: string },
  { email: string; specialization: string; experience: number },
  { rejectValue: string }
>('stylistInvite/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.createInvite(payload);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.CREATE_FAILED);
  }
});

export const fetchPaginatedStylists = createAsyncThunk<
  PaginatedStylistResponse,
  {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isBlocked?: boolean;
    isActive?: boolean;
    status?: string;
  },
  { rejectValue: string }
>('stylistInvite/fetchPaginatedStylists', async (params, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.getPaginatedStylists(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const blockUnblockStylist = createAsyncThunk<
  { success: boolean; isBlocked: boolean; stylistId: string },
  { stylistId: string; isBlocked: boolean },
  { rejectValue: string }
>('stylistInvite/blockUnblockStylist', async ({ stylistId, isBlocked }, { rejectWithValue }) => {
  try {
    await stylistInviteService.blockStylist(stylistId, isBlocked);
    return { success: true, isBlocked, stylistId };
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const applyAsStylist = createAsyncThunk<
  SuccessMessageResponse,
  { email: string; specialization: string; experience: number },
  { rejectValue: string }
>('auth/applyAsStylist', async (payload, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.applyAsStylist(payload);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.CREATE_FAILED);
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
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.NOT_FOUND);
  }
});

export const acceptInvite = createAsyncThunk<
  SuccessResponse,
  { token: string; name: string; phone?: string; password: string },
  { rejectValue: string }
>('stylistInvite/accept', async ({ token, ...data }, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.accept(token, data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
  }
});

export const fetchStylists = createAsyncThunk<StylistListItem[], void, { rejectValue: string }>(
  'stylistInvite/fetchStylists',
  async (_, { rejectWithValue }) => {
    try {
      const res = await stylistInviteService.listStylists();
      return res.data.data;
    } catch (err) {
      console.error('fetchStylists error:', err);
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);

export const approveStylist = createAsyncThunk<
  SuccessResponse,
  { userId: string },
  { rejectValue: string }
>('stylistInvite/approveStylist', async ({ userId }, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.approve(userId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const rejectStylist = createAsyncThunk<
  SuccessResponse,
  { userId: string },
  { rejectValue: string }
>('stylistInvite/rejectStylist', async ({ userId }, { rejectWithValue }) => {
  try {
    const res = await stylistInviteService.reject(userId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DELETE_FAILED);
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
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.CREATE_FAILED);
  }
});

export const toggleBlockStylist = createAsyncThunk<
  { success: boolean; block: boolean; userId: string },
  { userId: string; block: boolean },
  { rejectValue: string }
>('stylistInvite/toggleBlockStylist', async ({ userId, block }, { rejectWithValue }) => {
  try {
    await stylistInviteService.toggleBlock(userId, block);
    return { success: true, block, userId };
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});
