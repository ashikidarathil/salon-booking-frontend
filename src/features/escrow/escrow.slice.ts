import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { EscrowState } from './escrow.types';
import {
  fetchStylistEscrows,
  fetchHeldBalance,
  fetchAdminEscrows,
  fetchAdminStylistEscrows,
  fetchAdminStylistHeldBalance,
} from './escrow.thunks';

const initialState: EscrowState = {
  escrows: [],
  pagination: null,
  heldBalance: 0,
  loading: false,
  error: null,
};

const escrowSlice = createSlice({
  name: 'escrow',
  initialState,
  reducers: {
    clearEscrowError: (state) => {
      state.error = null;
    },
    resetEscrowState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Pending
      .addMatcher(
        isAnyOf(
          fetchStylistEscrows.pending,
          fetchAdminEscrows.pending,
          fetchAdminStylistEscrows.pending,
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      // Fulfilled (List/Pagination)
      .addMatcher(
        isAnyOf(
          fetchStylistEscrows.fulfilled,
          fetchAdminEscrows.fulfilled,
          fetchAdminStylistEscrows.fulfilled,
        ),
        (state, action) => {
          state.loading = false;
          state.escrows = action.payload.data;
          state.pagination = action.payload.pagination;
        },
      )
      // Fulfilled (Balance)
      .addMatcher(
        isAnyOf(fetchHeldBalance.fulfilled, fetchAdminStylistHeldBalance.fulfilled),
        (state, action) => {
          state.heldBalance = action.payload;
        },
      )
      // Rejected
      .addMatcher(
        isAnyOf(
          fetchStylistEscrows.rejected,
          fetchAdminEscrows.rejected,
          fetchAdminStylistEscrows.rejected,
        ),
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        },
      );
  },
});

export const { clearEscrowError, resetEscrowState } = escrowSlice.actions;
export default escrowSlice.reducer;
