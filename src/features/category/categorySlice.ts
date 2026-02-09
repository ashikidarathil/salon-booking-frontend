// src/features/category/category.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { Category } from './category.types';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  softDeleteCategory,
  restoreCategory,
  fetchPaginatedCategories,
  fetchPublicCategories,
} from './categoryThunks';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}

const initialState: CategoryState = {
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

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaginatedCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaginatedCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPaginatedCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories = state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        );
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.categories = state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, status: action.payload.status } : c,
        );
      })
      .addCase(softDeleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.map((c) =>
          c.id === action.payload ? { ...c, isDeleted: true, status: 'INACTIVE' } : c,
        );
      })
      .addCase(restoreCategory.fulfilled, (state, action) => {
        state.categories = state.categories.map((c) =>
          c.id === action.payload ? { ...c, isDeleted: false, status: 'ACTIVE' } : c,
        );
      });

    builder
      .addCase(fetchPublicCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchPublicCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching categories';
      });
  },
});

export default categorySlice.reducer;
