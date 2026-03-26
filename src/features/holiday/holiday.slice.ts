import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HolidayState, Holiday } from './holiday.types';
import { fetchHolidays, createHoliday, deleteHoliday } from './holiday.thunks';

const initialState: HolidayState = {
  holidays: [],
  loading: false,
  error: null,
};

const holidaySlice = createSlice({
  name: 'holiday',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHolidays.fulfilled, (state, action: PayloadAction<Holiday[]>) => {
        state.loading = false;
        state.holidays = action.payload;
      })
      .addCase(createHoliday.fulfilled, (state, action: PayloadAction<Holiday>) => {
        state.loading = false;
        state.holidays.unshift(action.payload);
      })
      .addCase(deleteHoliday.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.holidays = state.holidays.filter((h) => h.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.startsWith('holiday/'),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('holiday/'),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload || 'Something went wrong';
        },
      );
  },
});

export const { clearError } = holidaySlice.actions;
export default holidaySlice.reducer;
