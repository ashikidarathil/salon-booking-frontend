import { createSlice } from '@reduxjs/toolkit';
import type { BranchCategoryItem } from './branchCategory.types';
import {
  fetchBranchCategories,
  toggleBranchCategory,
  fetchBranchCategoriesPaginated,
} from './branchCategory.thunks';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

interface BranchCategoryState {
  categories: BranchCategoryItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}

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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchBranchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchBranchCategoriesPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchCategoriesPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBranchCategoriesPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleBranchCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.categoryId === action.payload.categoryId);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      });
  },
});

export default branchCategorySlice.reducer;
