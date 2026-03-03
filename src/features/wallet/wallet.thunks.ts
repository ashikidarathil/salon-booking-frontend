import { createAsyncThunk } from '@reduxjs/toolkit';
import WalletService from '../../services/wallet.service';
import { handleThunkError } from '../../common/utils/thunk.utils';

export const fetchMyWallet = createAsyncThunk(
  'wallet/fetchMyWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await WalletService.getMyWallet();
      return response.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue);
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'wallet/fetchTransactionHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await WalletService.getTransactionHistory();
      return response.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue);
    }
  }
);

export const creditWallet = createAsyncThunk(
  'wallet/creditWallet',
  async ({ amount, description }: { amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await WalletService.creditWallet(amount, description);
      return response.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue);
    }
  }
);
