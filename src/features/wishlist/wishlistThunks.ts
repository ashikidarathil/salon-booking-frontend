import { createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '@/services/wishlist.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';

export const fetchMyFavorites = createAsyncThunk<string[], { branchId?: string } | void>(
  'wishlist/fetchMyFavorites',
  async (params, { rejectWithValue }) => {
    try {
      const branchId = params && typeof params === 'object' ? params.branchId : undefined;
      const response = await wishlistService.getMyFavorites(branchId);
      return response;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'wishlist/toggleFavorite',
  async (stylistId: string, { rejectWithValue }) => {
    try {
      const data = await wishlistService.toggleFavorite(stylistId);
      return { stylistId, isAdded: data.isAdded };
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);
