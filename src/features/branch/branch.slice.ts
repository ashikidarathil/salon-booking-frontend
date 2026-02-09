// src/features/branch/branch.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { Branch } from './branch.types';
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
} from './branch.thunks';

import type { PaginationMetadata } from '@/common/types/pagination.metadata';

interface BranchState {
  branches: Branch[];
  nearestBranches: Branch[];
  selectedBranch: Branch | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}

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
    // ✅ NEW: Set selected branch (when user selects branch on listing page)
    setBranchSelected: (state, action: PayloadAction<Branch>) => {
      state.selectedBranch = action.payload;
      // Store in localStorage for persistence
      localStorage.setItem('selectedBranch', JSON.stringify(action.payload));
    },

    // ✅ NEW: Clear selected branch (when user changes branch)
    clearBranchSelected: (state) => {
      state.selectedBranch = null;
      localStorage.removeItem('selectedBranch');
    },

    // ✅ NEW: Load selected branch from localStorage (on app init)
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPaginatedBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      //Fetch Nearest Branch
      .addCase(fetchNearestBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearestBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.nearestBranches = action.payload;
      })
      .addCase(fetchNearestBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPaginatedBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPaginatedBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
      });

    builder
      .addCase(fetchPublicBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(fetchPublicBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching branches';
      });

    // Fetch single branch
    builder
      .addCase(fetchBranchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchById.fulfilled, (state) => {
        state.loading = false;
        // Optionally update in branches array or keep as separate state
      })
      .addCase(fetchBranchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching branch';
      });
  },
});

export const { setBranchSelected, clearBranchSelected, loadSelectedBranchFromStorage } =
  branchSlice.actions;
export default branchSlice.reducer;
