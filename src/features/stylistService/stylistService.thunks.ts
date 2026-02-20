import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  StylistServiceItem,
  FetchStylistServicesParams,
  ToggleStylistServicePayload,
} from './stylistService.types';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';

export const fetchStylistServicesPaginated = createAsyncThunk<
  {
    data: StylistServiceItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  },
  FetchStylistServicesParams,
  { rejectValue: string }
>('stylistService/fetchPaginated', async (params, { rejectWithValue }) => {
  try {
    const { stylistId, ...query } = params;
    const queryParams = new URLSearchParams();
    if (query.page) queryParams.append('page', query.page.toString());
    if (query.limit) queryParams.append('limit', query.limit.toString());
    if (query.search) queryParams.append('search', query.search);
    if (query.configured !== undefined) queryParams.append('configured', query.configured.toString());
    if (query.isActive !== undefined) queryParams.append('isActive', query.isActive.toString());

    const res = await api.get<ApiResponse<any>>(
      `${API_ROUTES.STYLIST_SERVICE.ADMIN.LIST_PAGINATED(stylistId)}?${queryParams.toString()}`,
    );
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const toggleStylistServiceStatus = createAsyncThunk<
  { success: boolean; serviceId: string; isActive: boolean },
  ToggleStylistServicePayload,
  { rejectValue: string }
>('stylistService/toggleStatus', async ({ stylistId, serviceId, isActive }, { rejectWithValue }) => {
  try {
    await api.patch(API_ROUTES.STYLIST_SERVICE.ADMIN.TOGGLE_STATUS(stylistId, serviceId), {
      isActive,
    });
    return { success: true, serviceId, isActive };
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});
