import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { SlotState } from './slot.types';
import {
  fetchAvailableSlots,
  fetchAdminSlots,
  fetchStylistSlots,
  blockSlot,
  unblockSlot,
} from './slot.thunks';

const initialState: SlotState = {
  availableSlots: [],
  loading: false,
  error: null,
};

const slotSlice = createSlice({
  name: 'slot',
  initialState,
  reducers: {
    clearSlotError: (state) => {
      state.error = null;
    },
    resetSlotState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(blockSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = state.availableSlots.map((s) =>
          s.id === action.payload.id ? action.payload : s,
        );
      })
      .addCase(unblockSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = state.availableSlots.map((s) =>
          s.id === action.payload.id ? action.payload : s,
        );
      })
      // Handle all fetching pending
      .addMatcher(
        isAnyOf(fetchAvailableSlots.pending, fetchAdminSlots.pending, fetchStylistSlots.pending),
        (state) => {
          state.loading = true;
          state.availableSlots = [];
          state.error = null;
        },
      )
      // Handle all fetching fulfilled
      .addMatcher(
        isAnyOf(
          fetchAvailableSlots.fulfilled,
          fetchAdminSlots.fulfilled,
          fetchStylistSlots.fulfilled,
        ),
        (state, action) => {
          state.loading = false;
          state.availableSlots = action.payload;
        },
      )
      // Handle all mutations pending
      .addMatcher(isAnyOf(blockSlot.pending, unblockSlot.pending), (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle all rejected
      .addMatcher(
        isAnyOf(
          fetchAvailableSlots.rejected,
          fetchAdminSlots.rejected,
          fetchStylistSlots.rejected,
          blockSlot.rejected,
          unblockSlot.rejected,
        ),
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        },
      );
  },
});

export const { clearSlotError, resetSlotState } = slotSlice.actions;
export default slotSlice.reducer;
