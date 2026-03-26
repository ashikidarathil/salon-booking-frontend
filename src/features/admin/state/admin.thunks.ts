import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '@/services/admin.service';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import { handleThunkError } from '@/common/utils/thunk.utils';
import type { AdminDashboardStats, AdminStatsQuery } from '../types/admin.types';

export const fetchAdminDashboardStats = createAsyncThunk<
  AdminDashboardStats,
  AdminStatsQuery | void,
  { rejectValue: string }
>('admin/fetchDashboardStats', async (params, { rejectWithValue }) => {
  try {
    const res = await adminService.getDashboardStats(params || undefined);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});
