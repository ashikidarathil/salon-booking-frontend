import { createAsyncThunk } from '@reduxjs/toolkit';
import ScheduleService from '@/services/schedule.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { SCHEDULE_MESSAGES } from './schedule.constants';
import type {
  WeeklySchedule,
  DailyOverride,
  StylistBreak,
  UpdateWeeklyScheduleDto,
  CreateDailyOverrideDto,
  CreateStylistBreakDto,
} from './schedule.types';

export const fetchWeeklySchedule = createAsyncThunk<
  WeeklySchedule[],
  { stylistId: string; branchId: string },
  { rejectValue: string }
>('schedule/fetchWeekly', async ({ stylistId, branchId }, { rejectWithValue }) => {
  try {
    const response = await ScheduleService.getWeeklySchedule(stylistId, branchId);
    return response.data.data;
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue, SCHEDULE_MESSAGES.FETCH_ERROR);
  }
});

export const updateWeeklySchedule = createAsyncThunk<
  WeeklySchedule,
  { dayOfWeek: number; data: UpdateWeeklyScheduleDto },
  { rejectValue: string }
>('schedule/updateWeekly', async ({ dayOfWeek, data }, { rejectWithValue }) => {
  try {
    const response = await ScheduleService.updateWeeklySchedule(dayOfWeek, data);
    return response.data.data;
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue, SCHEDULE_MESSAGES.UPDATE_ERROR);
  }
});

export const fetchDailyOverrides = createAsyncThunk<
  DailyOverride[],
  { stylistId: string; branchId: string },
  { rejectValue: string }
>('schedule/fetchDaily', async ({ stylistId, branchId }, { rejectWithValue }) => {
  try {
    const response = await ScheduleService.getDailyOverrides(stylistId, branchId);
    return response.data.data;
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue, SCHEDULE_MESSAGES.FETCH_ERROR);
  }
});

export const createDailyOverride = createAsyncThunk<
  DailyOverride,
  CreateDailyOverrideDto,
  { rejectValue: string }
>('schedule/createDaily', async (data, { rejectWithValue }) => {
  try {
    const response = await ScheduleService.createDailyOverride(data);
    return response.data.data;
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue, SCHEDULE_MESSAGES.CREATE_ERROR);
  }
});

export const deleteDailyOverride = createAsyncThunk<string, string, { rejectValue: string }>(
  'schedule/deleteDaily',
  async (overrideId, { rejectWithValue }) => {
    try {
      await ScheduleService.deleteDailyOverride(overrideId);
      return overrideId;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue, SCHEDULE_MESSAGES.DELETE_ERROR);
    }
  },
);

export const fetchBreaks = createAsyncThunk<
  StylistBreak[],
  { stylistId: string; branchId: string },
  { rejectValue: string }
>('schedule/fetchBreaks', async ({ stylistId, branchId }, { rejectWithValue }) => {
  try {
    const response = await ScheduleService.getBreaks(stylistId, branchId);
    return response.data.data;
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue, SCHEDULE_MESSAGES.FETCH_ERROR);
  }
});

export const createBreak = createAsyncThunk<
  StylistBreak,
  CreateStylistBreakDto,
  { rejectValue: string }
>('schedule/createBreak', async (data, { rejectWithValue }) => {
  try {
    const response = await ScheduleService.createBreak(data);
    return response.data.data;
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue, SCHEDULE_MESSAGES.CREATE_ERROR);
  }
});

export const deleteBreak = createAsyncThunk<string, string, { rejectValue: string }>(
  'schedule/deleteBreak',
  async (breakId, { rejectWithValue }) => {
    try {
      await ScheduleService.deleteBreak(breakId);
      return breakId;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue, SCHEDULE_MESSAGES.DELETE_ERROR);
    }
  },
);
