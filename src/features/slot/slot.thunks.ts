import { createAsyncThunk } from '@reduxjs/toolkit';
import { slotService } from '@/services/slot.service';
import type { ListSlotsParams } from '@/services/slot.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import type { SlotItem } from './slot.types';

export const fetchAvailableSlots = createAsyncThunk<
  SlotItem[],
  ListSlotsParams,
  { rejectValue: string }
>('slot/fetchAvailableSlots', async (params, { rejectWithValue }) => {
  try {
    const res = await slotService.listAvailableSlots(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to fetch available slots');
  }
});

export const lockSlot = createAsyncThunk<SlotItem, string, { rejectValue: string }>(
  'slot/lockSlot',
  async (slotId, { rejectWithValue }) => {
    try {
      const res = await slotService.lockSlot(slotId);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, 'Failed to lock slot');
    }
  },
);
