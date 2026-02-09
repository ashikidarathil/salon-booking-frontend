import { createSlice } from '@reduxjs/toolkit';
import type { BranchServiceItem } from './branchService.types';
import {
  fetchBranchServices,
  upsertBranchService,
  toggleBranchServiceStatus,
  fetchBranchServicesPaginated,
  fetchBranchServicePublicDetails,
  fetchBranchServicesPublicPaginated,
} from './branchService.thunks';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

interface BranchServiceState {
  services: BranchServiceItem[];
  currentService: BranchServiceItem | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}

const initialState: BranchServiceState = {
  services: [],
  loading: false,
  currentService: null,

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

const branchServiceSlice = createSlice({
  name: 'branchService',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchBranchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchBranchServicesPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchServicesPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBranchServicesPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(upsertBranchService.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s.serviceId === action.payload.serviceId);
        if (index !== -1) {
          state.services[index] = action.payload;
        } else {
          state.services.push(action.payload);
        }
      })
      .addCase(toggleBranchServiceStatus.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s.serviceId === action.payload.serviceId);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      });
    builder
      .addCase(fetchBranchServicesPublicPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchServicesPublicPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBranchServicesPublicPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching services';
      });

    // Fetch branch service details (for service details page)
    builder
      .addCase(fetchBranchServicePublicDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchServicePublicDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchBranchServicePublicDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching service details';
      });
  },
});

export default branchServiceSlice.reducer;
