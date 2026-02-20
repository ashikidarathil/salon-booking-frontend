import { createSlice } from '@reduxjs/toolkit';
import type { SlotState } from './slot.types';
import { fetchAvailableSlots, lockSlot } from './slot.thunks';

const initialState: SlotState = {
  availableSlots: [],
  loading: false,
  error: null,
  lastLockedSlot: null,
};

const slotSlice = createSlice({
  name: 'slot',
  initialState,
  reducers: {
    clearSlotError: (state) => {
      state.error = null;
    },
    resetSlotState: (state) => {
      state.availableSlots = [];
      state.lastLockedSlot = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Available Slots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Lock Slot
      .addCase(lockSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(lockSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.lastLockedSlot = action.payload;
      })
      .addCase(lockSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSlotError, resetSlotState } = slotSlice.actions;
export default slotSlice.reducer;
