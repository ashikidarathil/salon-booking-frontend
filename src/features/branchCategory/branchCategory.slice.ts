import { createSlice, isPending, isRejected } from '@reduxjs/toolkit';
import type { BranchCategoryState } from './branchCategory.types';
import {
  fetchBranchCategories,
  toggleBranchCategory,
  fetchBranchCategoriesPaginated,
} from './branchCategory.thunks';

const initialState: BranchCategoryState = {
  categories: [],
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

const branchCategorySlice = createSlice({
  name: 'branchCategory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchBranchCategoriesPaginated.fulfilled, (state, action) => {
        state.categories = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(toggleBranchCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.categoryId === action.payload.categoryId);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
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

export const { clearError } = branchCategorySlice.actions;
export default branchCategorySlice.reducer;
