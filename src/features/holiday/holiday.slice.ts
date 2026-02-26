import { createSlice, isPending, isRejected } from '@reduxjs/toolkit';
import type { HolidayState } from './holiday.types';
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
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = action.payload;
      })
      .addCase(createHoliday.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays.unshift(action.payload);
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = state.holidays.filter((h) => h.id !== action.payload);
      })
      .addMatcher(isPending(fetchHolidays, createHoliday, deleteHoliday), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isRejected(fetchHolidays, createHoliday, deleteHoliday), (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Something went wrong';
      });
  },
});

export const { clearError } = holidaySlice.actions;
export default holidaySlice.reducer;
