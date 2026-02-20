import { createAsyncThunk } from '@reduxjs/toolkit';
import { offDayService } from '@/services/offDay.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import type { RequestOffDayDto, UpdateOffDayStatusDto } from './offDay.types';

export const requestOffDay = createAsyncThunk(
  'offDay/request',
  async (data: RequestOffDayDto, { rejectWithValue }) => {
    try {
      const response = await offDayService.requestOffDay(data);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const fetchMyOffDays = createAsyncThunk('offDay/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const response = await offDayService.getMyOffDays();
    return response.data.data;
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue);
  }
});

export const fetchStylistOffDays = createAsyncThunk(
  'offDay/fetchStylist',
  async (stylistId: string, { rejectWithValue }) => {
    try {
      const response = await offDayService.getStylistOffDays(stylistId);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const fetchAllOffDays = createAsyncThunk(
  'offDay/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await offDayService.getAllOffDays();
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const updateOffDayStatus = createAsyncThunk(
  'offDay/updateStatus',
  async (
    { offDayId, data }: { offDayId: string; data: UpdateOffDayStatusDto },
    { rejectWithValue },
  ) => {
    try {
      const response = await offDayService.updateStatus(offDayId, data);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const deleteOffDay = createAsyncThunk(
  'offDay/delete',
  async (offDayId: string, { rejectWithValue }) => {
    try {
      await offDayService.deleteOffDay(offDayId);
      return offDayId;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);
