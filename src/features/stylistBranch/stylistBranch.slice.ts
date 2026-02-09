import { createSlice } from '@reduxjs/toolkit';
import type { BranchStylist, UnassignedStylist } from './stylistBranch.types';
import {
  fetchBranchStylists,
  fetchUnassignedStylists,
  assignStylist,
  unassignStylist,
  changeStylistBranch,
  fetchBranchStylistsPaginated,
  fetchUnassignedStylistsPaginated,
} from './stylistBranch.thunks';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

interface StylistBranchState {
  assignedStylists: BranchStylist[];
  unassignedOptions: UnassignedStylist[];
  loading: boolean;
  error: string | null;
  assignedPagination: PaginationMetadata;
  unassignedPagination: PaginationMetadata;
}

const initialPagination: PaginationMetadata = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPreviousPage: false,
};

const initialState: StylistBranchState = {
  assignedStylists: [],
  unassignedOptions: [],
  loading: false,
  error: null,
  assignedPagination: initialPagination,
  unassignedPagination: initialPagination,
};

const stylistBranchSlice = createSlice({
  name: 'stylistBranch',
  initialState,
  reducers: {
    clearStylistBranchState: (state) => {
      state.assignedStylists = [];
      state.unassignedOptions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assigned stylists
      .addCase(fetchBranchStylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchStylists.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedStylists = action.payload;
      })
      .addCase(fetchBranchStylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch unassigned options
      .addCase(fetchUnassignedStylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnassignedStylists.fulfilled, (state, action) => {
        state.loading = false;
        state.unassignedOptions = action.payload;
      })
      .addCase(fetchUnassignedStylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchBranchStylistsPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchStylistsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedStylists = action.payload.data;
        state.assignedPagination = action.payload.pagination;
      })
      .addCase(fetchBranchStylistsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchUnassignedStylistsPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnassignedStylistsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.unassignedOptions = action.payload.data;
        state.unassignedPagination = action.payload.pagination;
      })
      .addCase(fetchUnassignedStylistsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Assign stylist
      .addCase(assignStylist.fulfilled, (state, action) => {
        state.assignedStylists.push(action.payload);
        // Remove from unassigned options
        state.unassignedOptions = state.unassignedOptions.filter(
          (opt) => opt.stylistId !== action.payload.stylistId,
        );
      })

      // Unassign stylist
      .addCase(unassignStylist.fulfilled, (state, action) => {
        const { stylistId } = action.meta.arg;
        state.assignedStylists = state.assignedStylists.filter((s) => s.stylistId !== stylistId);
      })

      // Change branch
      .addCase(changeStylistBranch.fulfilled, (state, action) => {
        const { stylistId } = action.meta.arg;
        const index = state.assignedStylists.findIndex((s) => s.stylistId === stylistId);
        if (index !== -1) {
          state.assignedStylists[index] = action.payload;
        }
      });
  },
});

export const { clearStylistBranchState } = stylistBranchSlice.actions;
export default stylistBranchSlice.reducer;
