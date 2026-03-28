import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  StylistWalletState,
  StylistWallet,
} from '@/features/stylistWallet/stylistWallet.types';
import {
  fetchStylistWallet,
  fetchStylistWalletById,
} from '@/features/stylistWallet/stylistWallet.thunks';

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
      .addCase(fetchStylistWallet.fulfilled, (state, action: PayloadAction<StylistWallet>) => {
        state.loading = false;
        state.wallet = action.payload;
      })

      // ── Admin: Fetch Stylist Wallet By ID ─────────────────────────────────
      .addCase(fetchStylistWalletById.fulfilled, (state, action: PayloadAction<StylistWallet>) => {
        state.loading = false;
        state.selectedStylistWallet = action.payload;
      })

      // Shared Pending Matcher
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.startsWith('stylistWallet/'),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )

      // Shared Rejected Matcher
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('stylistWallet/'),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload || null;
        },
      );
  },
});

export const { clearStylistWalletError, resetStylistWallet } = stylistWalletSlice.actions;
export default stylistWalletSlice.reducer;
