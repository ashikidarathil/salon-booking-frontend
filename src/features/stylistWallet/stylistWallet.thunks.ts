import { createAsyncThunk } from '@reduxjs/toolkit';
import StylistWalletService from '@/services/stylistWallet.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import type { StylistWallet } from '@/features/stylistWallet/stylistWallet.types';
import { STYLIST_WALLET_MESSAGES } from '@/features/stylistWallet/stylistWallet.constants';

export const fetchStylistWallet = createAsyncThunk<StylistWallet, void, { rejectValue: string }>(
  'stylistWallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      return await StylistWalletService.getWallet();
    } catch (error) {
      return handleThunkError(error, rejectWithValue, STYLIST_WALLET_MESSAGES.FETCH_ERROR);
    }
  },
);

// Admin: fetch a specific stylist's wallet
export const fetchStylistWalletById = createAsyncThunk<
  StylistWallet,
  string,
  { rejectValue: string }
>('stylistWallet/fetchWalletById', async (stylistId, { rejectWithValue }) => {
  try {
    return await StylistWalletService.getWalletByStylistId(stylistId);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, STYLIST_WALLET_MESSAGES.FETCH_ERROR);
  }
});
