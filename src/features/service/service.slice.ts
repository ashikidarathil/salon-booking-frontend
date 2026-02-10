import { createSlice, isPending, isRejected } from '@reduxjs/toolkit';
import type { ServiceState } from './service.types';
import {
  fetchServices,
  createService,
  updateService,
  toggleServiceStatus,
  uploadServiceImage,
  deleteServiceImage,
  softDeleteService,
  restoreService,
  fetchPaginatedServices,
  fetchPublicServiceDetails,
  fetchPublicServicesPaginated,
} from './serviceThunks';

const initialState: ServiceState = {
  services: [],
  loading: false,
  currentService: null,
  imageLoading: false,
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

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaginatedServices.fulfilled, (state, action) => {
        state.services = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.services = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.services.push(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.services = state.services.map((s) =>
          s.id === action.payload.id ? action.payload : s,
        );
      })
      .addCase(toggleServiceStatus.fulfilled, (state, action) => {
        state.services = state.services.map((s) =>
          s.id === action.payload.id ? action.payload : s,
        );
      })
      .addCase(uploadServiceImage.pending, (state) => {
        state.imageLoading = true;
      })
      .addCase(uploadServiceImage.fulfilled, (state, action) => {
        state.imageLoading = false;
        state.services = state.services.map((s) =>
          s.id === action.payload.id ? action.payload : s,
        );
      })
      .addCase(uploadServiceImage.rejected, (state) => {
        state.imageLoading = false;
      })
      .addCase(deleteServiceImage.fulfilled, (state, action) => {
        state.services = state.services.map((s) =>
          s.id === action.payload.id ? action.payload : s,
        );
      })
      .addCase(softDeleteService.fulfilled, (state, action) => {
        state.services = state.services.map((s) =>
          s.id === action.payload.id ? action.payload : s,
        );
      })
      .addCase(restoreService.fulfilled, (state, action) => {
        state.services = state.services.map((s) =>
          s.id === action.payload.id ? action.payload : s,
        );
      })
      .addCase(fetchPublicServicesPaginated.fulfilled, (state, action) => {
        state.services = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPublicServiceDetails.fulfilled, (state, action) => {
        state.currentService = action.payload;
      })
      .addMatcher(isPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        },
      );
  },
});

export default serviceSlice.reducer;
