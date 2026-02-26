import { createAsyncThunk } from '@reduxjs/toolkit';
import { holidayService } from '@/services/holiday.service';
import type { Holiday, CreateHolidayDto } from './holiday.types';
import { HOLIDAY_MESSAGES } from './holiday.constants';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const fetchHolidays = createAsyncThunk<
  Holiday[],
  string | undefined,
  { rejectValue: string }
>('holiday/fetchHolidays', async (branchId, { rejectWithValue }) => {
  try {
    const response = await holidayService.listHolidays(branchId);
    return response.data.data;
  } catch (error) {
    return handleThunkError(error, rejectWithValue, HOLIDAY_MESSAGES.FETCH_FAILED);
  }
});

export const createHoliday = createAsyncThunk<Holiday, CreateHolidayDto, { rejectValue: string }>(
  'holiday/createHoliday',
  async (data, { rejectWithValue }) => {
    try {
      const response = await holidayService.createHoliday(data);
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, HOLIDAY_MESSAGES.CREATE_FAILED);
    }
  },
);

export const deleteHoliday = createAsyncThunk<string, string, { rejectValue: string }>(
  'holiday/deleteHoliday',
  async (id, { rejectWithValue }) => {
    try {
      await holidayService.deleteHoliday(id);
      return id;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, HOLIDAY_MESSAGES.DELETE_FAILED);
    }
  },
);
