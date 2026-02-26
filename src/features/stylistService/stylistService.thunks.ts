import { createAsyncThunk } from '@reduxjs/toolkit';
import { stylistServiceService } from '@/services/stylistService.service';
import type {
  StylistServiceItem,
  FetchStylistServicesParams,
  ToggleStylistServicePayload,
  StylistServicePagination,
} from './stylistService.types';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const fetchStylistServicesPaginated = createAsyncThunk<
  {
    data: StylistServiceItem[];
    pagination: StylistServicePagination;
  },
  FetchStylistServicesParams,
  { rejectValue: string }
>('stylistService/fetchPaginated', async (params, { rejectWithValue }) => {
  try {
    const res = await stylistServiceService.getStylistServices(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue);
  }
});

export const toggleStylistServiceStatus = createAsyncThunk<
  { success: boolean; serviceId: string; isActive: boolean },
  ToggleStylistServicePayload,
  { rejectValue: string }
>(
  'stylistService/toggleStatus',
  async ({ stylistId, serviceId, isActive }, { rejectWithValue }) => {
    try {
      await stylistServiceService.toggleStatus(stylistId, serviceId, isActive);
      return { success: true, serviceId, isActive };
    } catch (err) {
      return handleThunkError(err, rejectWithValue);
    }
  },
);
