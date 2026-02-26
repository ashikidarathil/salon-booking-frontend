import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { OffDay } from './offDay.types';
import {
  requestOffDay,
  fetchMyOffDays,
  fetchStylistOffDays,
  fetchAllOffDays,
  updateOffDayStatus,
  deleteOffDay,
} from './offDay.thunks';

interface OffDayState {
  myOffDays: OffDay[];
  allOffDays: OffDay[];
  currentStylistOffDays: OffDay[];
  loading: boolean;
  error: string | null;
}

const initialState: OffDayState = {
  myOffDays: [],
  allOffDays: [],
  currentStylistOffDays: [],
  loading: false,
  error: null,
};

const offDaySlice = createSlice({
  name: 'offDay',
  initialState,
  reducers: {
    clearOffDayError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestOffDay.fulfilled, (state, action) => {
        state.myOffDays.push(action.payload);
        state.loading = false;
      })
      .addCase(fetchMyOffDays.fulfilled, (state, action) => {
        state.myOffDays = action.payload;
        state.loading = false;
      })
      .addCase(fetchStylistOffDays.fulfilled, (state, action) => {
        state.currentStylistOffDays = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllOffDays.fulfilled, (state, action) => {
        state.allOffDays = action.payload;
        state.loading = false;
      })
      .addCase(updateOffDayStatus.fulfilled, (state, action) => {
        const index = state.allOffDays.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.allOffDays[index] = action.payload;
        }
        const myIndex = state.myOffDays.findIndex((o) => o.id === action.payload.id);
        if (myIndex !== -1) {
          state.myOffDays[myIndex] = action.payload;
        }
        state.loading = false;
      })
      .addCase(deleteOffDay.fulfilled, (state, action) => {
        state.myOffDays = state.myOffDays.filter((o) => o.id !== action.payload);
        state.allOffDays = state.allOffDays.filter((o) => o.id !== action.payload);
        state.loading = false;
      })
      .addMatcher(
        isAnyOf(
          requestOffDay.pending,
          fetchMyOffDays.pending,
          fetchStylistOffDays.pending,
          fetchAllOffDays.pending,
          updateOffDayStatus.pending,
          deleteOffDay.pending,
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          requestOffDay.rejected,
          fetchMyOffDays.rejected,
          fetchStylistOffDays.rejected,
          fetchAllOffDays.rejected,
          updateOffDayStatus.rejected,
          deleteOffDay.rejected,
        ),
        (state, action) => {
          state.loading = false;
          state.error = (action.payload as string) || 'Something went wrong';
        },
      );
  },
});

export const { clearOffDayError } = offDaySlice.actions;
export default offDaySlice.reducer;
