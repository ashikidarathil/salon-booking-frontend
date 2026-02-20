import { createSlice, isPending, isRejected } from '@reduxjs/toolkit';
import type { WeeklySchedule, DailyOverride } from './schedule.types';
import {
  fetchWeeklySchedule,
  updateWeeklySchedule,
  fetchDailyOverrides,
  createDailyOverride,
  deleteDailyOverride,
} from './schedule.thunks';

interface ScheduleState {
  weeklySchedule: WeeklySchedule[];
  dailyOverrides: DailyOverride[];
  loading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  weeklySchedule: [],
  dailyOverrides: [],
  loading: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    clearScheduleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeeklySchedule.fulfilled, (state, action) => {
        state.weeklySchedule = action.payload;
        state.loading = false;
      })
      .addCase(updateWeeklySchedule.fulfilled, (state, action) => {
        const index = state.weeklySchedule.findIndex(
          (s) => s.dayOfWeek === action.payload.dayOfWeek,
        );
        if (index !== -1) {
          state.weeklySchedule[index] = action.payload;
        } else {
          state.weeklySchedule.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(fetchDailyOverrides.fulfilled, (state, action) => {
        state.dailyOverrides = action.payload;
        state.loading = false;
      })
      .addCase(createDailyOverride.fulfilled, (state, action) => {
        state.dailyOverrides.push(action.payload);
        state.loading = false;
      })
      .addCase(deleteDailyOverride.fulfilled, (state, action) => {
        state.dailyOverrides = state.dailyOverrides.filter((o) => o.id !== action.payload);
        state.loading = false;
      })
      .addMatcher(isPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Something went wrong';
      });
  },
});

export const { clearScheduleError } = scheduleSlice.actions;
export default scheduleSlice.reducer;
