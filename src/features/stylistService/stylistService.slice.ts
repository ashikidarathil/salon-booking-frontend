import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { StylistServiceState } from './stylistService.types';
import { fetchStylistServicesPaginated, toggleStylistServiceStatus } from './stylistService.thunks';

const initialState: StylistServiceState = {
  services: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const stylistServiceSlice = createSlice({
  name: 'stylistService',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStylistServicesPaginated.fulfilled, (state, action) => {
        state.services = action.payload.data;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(toggleStylistServiceStatus.fulfilled, (state, action) => {
        const { serviceId, isActive } = action.payload;
        const service = state.services.find((s) => s.serviceId === serviceId);
        if (service) {
          service.isActive = isActive;
        }
        state.loading = false;
      })
      .addMatcher(
        isAnyOf(fetchStylistServicesPaginated.pending, toggleStylistServiceStatus.pending),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(fetchStylistServicesPaginated.rejected, toggleStylistServiceStatus.rejected),
        (state, action) => {
          state.loading = false;
          state.error = (action.payload as string) || 'Something went wrong';
        },
      );
  },
});

export const { clearError } = stylistServiceSlice.actions;
export default stylistServiceSlice.reducer;
