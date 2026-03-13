import { createAsyncThunk } from '@reduxjs/toolkit';
import StylistWalletService from '../../services/stylistWallet.service';
import { handleThunkError } from '../../common/utils/thunk.utils';
import type { StylistWallet } from './stylistWallet.types';

const STYLIST_WALLET_ERROR = 'Failed to fetch stylist wallet';

export const fetchStylistWallet = createAsyncThunk<StylistWallet, void, { rejectValue: string }>(
  'stylistWallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StylistWalletService.getWallet();
      return response.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, STYLIST_WALLET_ERROR);
    }
  },
);

// Admin: fetch a specific stylist's wallet
export const fetchStylistWalletById = createAsyncThunk<StylistWallet, string, { rejectValue: string }>(
  'stylistWallet/fetchWalletById',
  async (stylistId, { rejectWithValue }) => {
    try {
      const response = await StylistWalletService.getWalletByStylistId(stylistId);
      return response.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, STYLIST_WALLET_ERROR);
    }
  },
);
