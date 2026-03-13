import { createSlice } from '@reduxjs/toolkit';
import type { StylistWalletState } from './stylistWallet.types';
import { fetchStylistWallet, fetchStylistWalletById } from './stylistWallet.thunks';

const initialState: StylistWalletState = {
  wallet: null,
  selectedStylistWallet: null,
  loading: false,
  error: null,
};

const stylistWalletSlice = createSlice({
  name: 'stylistWallet',
  initialState,
  reducers: {
    clearStylistWalletError: (state) => {
      state.error = null;
    },
    resetStylistWallet: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch Wallet ──────────────────────────────
      .addCase(fetchStylistWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStylistWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchStylistWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // ── Admin: Fetch Stylist Wallet By ID ─────────────────────────────────
      .addCase(fetchStylistWalletById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStylistWalletById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStylistWallet = action.payload;
      })
      .addCase(fetchStylistWalletById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

export const { clearStylistWalletError, resetStylistWallet } = stylistWalletSlice.actions;
export default stylistWalletSlice.reducer;
