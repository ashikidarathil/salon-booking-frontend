import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ScheduleState, WeeklySchedule, DailyOverride, StylistBreak } from './schedule.types';
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
      // ── Weekly Schedule ─────────────────────────────────
      .addCase(fetchWeeklySchedule.fulfilled, (state, action: PayloadAction<WeeklySchedule[]>) => {
        state.loading = false;
        state.weeklySchedule = action.payload;
      })
      .addCase(updateWeeklySchedule.fulfilled, (state, action: PayloadAction<WeeklySchedule>) => {
        state.loading = false;
        const index = state.weeklySchedule.findIndex(
          (s) => s.dayOfWeek === action.payload.dayOfWeek,
        );
        if (index !== -1) {
          state.weeklySchedule[index] = action.payload;
        } else {
          state.weeklySchedule.push(action.payload);
        }
      })

      // ── Daily Overrides ─────────────────────────────────
      .addCase(fetchDailyOverrides.fulfilled, (state, action: PayloadAction<DailyOverride[]>) => {
        state.loading = false;
        state.dailyOverrides = action.payload;
      })
      .addCase(createDailyOverride.fulfilled, (state, action: PayloadAction<DailyOverride>) => {
        state.loading = false;
        const index = state.dailyOverrides.findIndex(
          (o) => o.id === action.payload.id || o.date === action.payload.date,
        );
        if (index !== -1) {
          state.dailyOverrides[index] = action.payload;
        } else {
          state.dailyOverrides.push(action.payload);
        }
      })
      .addCase(deleteDailyOverride.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.dailyOverrides = state.dailyOverrides.filter((o) => o.id !== action.payload);
      })

      // ── Breaks ──────────────────────────────────────────
      .addCase(fetchBreaks.fulfilled, (state, action: PayloadAction<StylistBreak[]>) => {
        state.loading = false;
        state.breaks = action.payload;
      })
      .addCase(createBreak.fulfilled, (state, action: PayloadAction<StylistBreak>) => {
        state.loading = false;
        state.breaks.push(action.payload);
      })
      .addCase(deleteBreak.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.breaks = state.breaks.filter((b) => b.id !== action.payload);
      })

      // ── Shared Matchers ─────────────────────────────────
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.startsWith('schedule/'),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('schedule/'),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload || 'Something went wrong';
        },
      );
  },
});

export const { clearScheduleError } = scheduleSlice.actions;
export default scheduleSlice.reducer;
