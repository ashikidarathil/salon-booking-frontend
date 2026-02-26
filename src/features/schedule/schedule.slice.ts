import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { WeeklySchedule, DailyOverride, StylistBreak } from './schedule.types';
import {
  fetchWeeklySchedule,
  updateWeeklySchedule,
  fetchDailyOverrides,
  createDailyOverride,
  deleteDailyOverride,
  fetchBreaks,
  createBreak,
  deleteBreak,
} from './schedule.thunks';

interface ScheduleState {
  weeklySchedule: WeeklySchedule[];
  dailyOverrides: DailyOverride[];
  breaks: StylistBreak[];
  loading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  weeklySchedule: [],
  dailyOverrides: [],
  breaks: [],
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
        const index = state.dailyOverrides.findIndex(
          (o) => o.id === action.payload.id || o.date === action.payload.date,
        );
        if (index !== -1) {
          state.dailyOverrides[index] = action.payload;
        } else {
          state.dailyOverrides.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(deleteDailyOverride.fulfilled, (state, action) => {
        state.dailyOverrides = state.dailyOverrides.filter((o) => o.id !== action.payload);
        state.loading = false;
      })
      .addCase(fetchBreaks.fulfilled, (state, action) => {
        state.breaks = action.payload;
        state.loading = false;
      })
      .addCase(createBreak.fulfilled, (state, action) => {
        state.breaks.push(action.payload);
        state.loading = false;
      })
      .addCase(deleteBreak.fulfilled, (state, action) => {
        state.breaks = state.breaks.filter((b) => b.id !== action.payload);
        state.loading = false;
      })
      .addMatcher(
        isAnyOf(
          fetchWeeklySchedule.pending,
          updateWeeklySchedule.pending,
          fetchDailyOverrides.pending,
          createDailyOverride.pending,
          deleteDailyOverride.pending,
          fetchBreaks.pending,
          createBreak.pending,
          deleteBreak.pending,
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchWeeklySchedule.rejected,
          updateWeeklySchedule.rejected,
          fetchDailyOverrides.rejected,
          createDailyOverride.rejected,
          deleteDailyOverride.rejected,
          fetchBreaks.rejected,
          createBreak.rejected,
          deleteBreak.rejected,
        ),
        (state, action) => {
          state.loading = false;
          state.error = (action.payload as string) || 'Something went wrong';
        },
      );
  },
});

export const { clearScheduleError } = scheduleSlice.actions;
export default scheduleSlice.reducer;
