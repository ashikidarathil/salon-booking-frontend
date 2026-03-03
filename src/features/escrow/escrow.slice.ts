import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { EscrowState, EscrowResponse } from './escrow.types';
import { fetchAdminEscrows, fetchEscrowByBooking } from './escrow.thunks';

const initialState: EscrowState = {
  escrows: [],
  currentEscrow: null,
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
    clearCurrentEscrow: (state) => {
      state.currentEscrow = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Escrows
      .addCase(fetchAdminEscrows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminEscrows.fulfilled, (state, action: PayloadAction<EscrowResponse[]>) => {
        state.loading = false;
        state.escrows = action.payload;
      })
      .addCase(fetchAdminEscrows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Escrow By Booking
      .addCase(fetchEscrowByBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEscrowByBooking.fulfilled, (state, action: PayloadAction<EscrowResponse>) => {
        state.loading = false;
        state.currentEscrow = action.payload;
      })
      .addCase(fetchEscrowByBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEscrowError, clearCurrentEscrow } = escrowSlice.actions;
export default escrowSlice.reducer;
