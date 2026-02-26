import { createAsyncThunk } from '@reduxjs/toolkit';
import { scheduleService } from '@/services/schedule.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import type {
  UpdateWeeklyScheduleDto,
  CreateDailyOverrideDto,
  CreateStylistBreakDto,
} from './schedule.types';

export const fetchWeeklySchedule = createAsyncThunk(
  'schedule/fetchWeekly',
  async ({ stylistId, branchId }: { stylistId: string; branchId: string }, { rejectWithValue }) => {
    try {
      const response = await scheduleService.getWeeklySchedule(stylistId, branchId);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const updateWeeklySchedule = createAsyncThunk(
  'schedule/updateWeekly',
  async (
    { dayOfWeek, data }: { dayOfWeek: number; data: UpdateWeeklyScheduleDto },
    { rejectWithValue },
  ) => {
    try {
      const response = await scheduleService.updateWeeklySchedule(dayOfWeek, data);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const fetchDailyOverrides = createAsyncThunk(
  'schedule/fetchDaily',
  async ({ stylistId, branchId }: { stylistId: string; branchId: string }, { rejectWithValue }) => {
    try {
      const response = await scheduleService.getDailyOverrides(stylistId, branchId);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const createDailyOverride = createAsyncThunk(
  'schedule/createDaily',
  async (data: CreateDailyOverrideDto, { rejectWithValue }) => {
    try {
      const response = await scheduleService.createDailyOverride(data);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const deleteDailyOverride = createAsyncThunk(
  'schedule/deleteDaily',
  async (overrideId: string, { rejectWithValue }) => {
    try {
      await scheduleService.deleteDailyOverride(overrideId);
      return overrideId;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const fetchBreaks = createAsyncThunk(
  'schedule/fetchBreaks',
  async ({ stylistId, branchId }: { stylistId: string; branchId: string }, { rejectWithValue }) => {
    try {
      const response = await scheduleService.getBreaks(stylistId, branchId);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const createBreak = createAsyncThunk(
  'schedule/createBreak',
  async (data: CreateStylistBreakDto, { rejectWithValue }) => {
    try {
      const response = await scheduleService.createBreak(data);
      return response.data.data;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);

export const deleteBreak = createAsyncThunk(
  'schedule/deleteBreak',
  async (breakId: string, { rejectWithValue }) => {
    try {
      await scheduleService.deleteBreak(breakId);
      return breakId;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue);
    }
  },
);
