import { createSlice } from '@reduxjs/toolkit';
import type { Service } from './service.types';
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
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

interface ServiceState {
  services: Service[];
  loading: boolean;
  currentService: Service | null;
  imageLoading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}

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
      .addCase(fetchPaginatedServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaginatedServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPaginatedServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
      .addCase(uploadServiceImage.rejected, (state, action) => {
        state.imageLoading = false;
        state.error = action.payload as string;
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
      });

    builder
      .addCase(fetchPublicServicesPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicServicesPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPublicServicesPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching services';
      });

    // Fetch service details
    builder
      .addCase(fetchPublicServiceDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicServiceDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchPublicServiceDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching service details';
      });
  },
});

export default serviceSlice.reducer;
