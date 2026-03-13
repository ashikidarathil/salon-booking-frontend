import { createSlice } from '@reduxjs/toolkit';
import type { EscrowState } from './escrow.types';
import { 
  fetchStylistEscrows, 
  fetchHeldBalance, 
  fetchAdminEscrows, 
  fetchAdminStylistEscrows, 
  fetchAdminStylistHeldBalance 
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
    // fetchStylistEscrows
    builder.addCase(fetchStylistEscrows.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStylistEscrows.fulfilled, (state, action) => {
      state.loading = false;
      state.escrows = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchStylistEscrows.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch stylist escrows';
    });

    // fetchAdminEscrows
    builder.addCase(fetchAdminEscrows.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminEscrows.fulfilled, (state, action) => {
      state.loading = false;
      state.escrows = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchAdminEscrows.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch admin escrows';
    });

    // fetchAdminStylistEscrows
    builder.addCase(fetchAdminStylistEscrows.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminStylistEscrows.fulfilled, (state, action) => {
      state.loading = false;
      state.escrows = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchAdminStylistEscrows.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch stylist escrows';
    });

    // fetchHeldBalance
    builder.addCase(fetchHeldBalance.fulfilled, (state, action) => {
      state.heldBalance = action.payload;
    });

    // fetchAdminStylistHeldBalance
    builder.addCase(fetchAdminStylistHeldBalance.fulfilled, (state, action) => {
      state.heldBalance = action.payload;
    });
  },
});

export const { clearEscrowError, resetEscrowState } = escrowSlice.actions;
export default escrowSlice.reducer;
