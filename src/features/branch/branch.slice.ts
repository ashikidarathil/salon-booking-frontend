import { createSlice, isPending, isRejected } from '@reduxjs/toolkit';
import type { Branch, BranchState } from './branch.types';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchBranches,
  createBranch,
  updateBranch,
  softDeleteBranch,
  restoreBranch,
  fetchPaginatedBranches,
  fetchNearestBranches,
  fetchBranchById,
  fetchPublicBranches,
  fetchPublicPaginatedBranches,
} from './branch.thunks';

const initialState: BranchState = {
  branches: [],
  nearestBranches: [],
  selectedBranch: null,
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

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setBranchSelected: (state, action: PayloadAction<Branch>) => {
      state.selectedBranch = action.payload;
      localStorage.setItem('selectedBranch', JSON.stringify(action.payload));
    },
    clearBranchSelected: (state) => {
      state.selectedBranch = null;
      localStorage.removeItem('selectedBranch');
    },
    loadSelectedBranchFromStorage: (state) => {
      const saved = localStorage.getItem('selectedBranch');
      if (saved) {
        try {
          state.selectedBranch = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse selected branch from storage', e);
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.branches = action.payload;
      })
      .addCase(fetchNearestBranches.fulfilled, (state, action) => {
        state.nearestBranches = action.payload;
      })
      .addCase(fetchPaginatedBranches.fulfilled, (state, action) => {
        state.branches = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPublicBranches.fulfilled, (state, action) => {
        state.branches = action.payload;
      })
      .addCase(fetchPublicPaginatedBranches.fulfilled, (state, action) => {
        state.branches = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBranchById.fulfilled, (state, action) => {
        state.selectedBranch = action.payload;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.branches.push(action.payload);
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.branches = state.branches.map((b) =>
          b.id === action.payload.id ? action.payload : b,
        );
      })
      .addCase(softDeleteBranch.fulfilled, (state, action) => {
        state.branches = state.branches.map((b) =>
          b.id === action.payload.id ? action.payload : b,
        );
      })
      .addCase(restoreBranch.fulfilled, (state, action) => {
        state.branches = state.branches.map((b) =>
          b.id === action.payload.id ? action.payload : b,
        );
      })
      .addMatcher(isPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Something went wrong';
      })
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        },
      );
  },
});

export const {
  setBranchSelected,
  clearBranchSelected,
  loadSelectedBranchFromStorage,
  clearError,
} = branchSlice.actions;
export default branchSlice.reducer;
