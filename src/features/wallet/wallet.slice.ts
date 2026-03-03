import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WalletState, WalletResponse, WalletTransaction } from './wallet.types';
import { fetchMyWallet, fetchTransactionHistory, creditWallet } from './wallet.thunks';

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
        state.error = action.payload as string;
      })
      // Fetch Transactions
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action: PayloadAction<WalletTransaction[]>) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Credit Wallet
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
        state.error = action.payload as string;
      });
  },
});

export const { clearWalletError, resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;
