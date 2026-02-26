import { createAsyncThunk } from '@reduxjs/toolkit';
import { slotService } from '@/services/slot.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import type { SlotItem, ListSlotsParams } from './slot.types';

export const fetchAvailableSlots = createAsyncThunk<
  SlotItem[],
  ListSlotsParams,
  { rejectValue: string }
>('slot/fetchAvailableSlots', async (params, { rejectWithValue }) => {
  try {
    const res = await slotService.listAvailableSlots(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const fetchAdminSlots = createAsyncThunk<
  SlotItem[],
  ListSlotsParams,
  { rejectValue: string }
>('slot/fetchAdminSlots', async (params, { rejectWithValue }) => {
  try {
    const res = await slotService.adminListSlots(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const fetchStylistSlots = createAsyncThunk<
  SlotItem[],
  { branchId: string; date: string; stylistId?: string },
  { rejectValue: string }
>('slot/fetchStylistSlots', async (params, { rejectWithValue }) => {
  try {
    const res = await slotService.getStylistSlots(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const blockSlot = createAsyncThunk<
  SlotItem,
  { slotId: string; reason?: string },
  { rejectValue: string }
>('slot/blockSlot', async ({ slotId, reason }, { rejectWithValue }) => {
  try {
    const res = await slotService.blockSlot(slotId, reason);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const unblockSlot = createAsyncThunk<SlotItem, string, { rejectValue: string }>(
  'slot/unblockSlot',
  async (slotId, { rejectWithValue }) => {
    try {
      const res = await slotService.unblockSlot(slotId);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
    }
  },
);
