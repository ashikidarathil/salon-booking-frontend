import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WalletState, WalletResponse, WalletTransaction } from './wallet.types';
import { fetchMyWallet, fetchTransactionHistory, creditWallet, topUpWallet } from './wallet.thunks';

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    resetWalletState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wallet
      .addCase(fetchMyWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyWallet.fulfilled, (state, action: PayloadAction<WalletResponse>) => {
        state.isLoading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchMyWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      // Fetch Transactions
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactionHistory.fulfilled,
        (state, action: PayloadAction<WalletTransaction[]>) => {
          state.isLoading = false;
          state.transactions = action.payload;
        },
      )
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      // Credit Wallet (direct)
      .addCase(creditWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(creditWallet.fulfilled, (state, action: PayloadAction<WalletResponse>) => {
        state.isLoading = false;
        state.wallet = action.payload;
      })
      .addCase(creditWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      // Top-Up via Razorpay
      .addCase(topUpWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(topUpWallet.fulfilled, (state, action: PayloadAction<WalletResponse>) => {
        state.isLoading = false;
        state.wallet = action.payload;
      })
      .addCase(topUpWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload !== 'DISMISSED' ? action.payload || null : null;
      });
  },
});

export const { clearWalletError, resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;
