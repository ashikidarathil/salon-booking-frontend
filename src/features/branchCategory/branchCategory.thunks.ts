import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { branchCategoryService } from '@/services/branchCategory.service';
import type { BranchCategoryItem } from './branchCategory.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export const fetchBranchCategories = createAsyncThunk<
  BranchCategoryItem[],
  string,
  { rejectValue: string }
>('branchCategory/fetchBranchCategories', async (branchId, { rejectWithValue }) => {
  try {
    const res = await branchCategoryService.list(branchId);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
    return rejectWithValue('Failed to fetch categories');
  }
});

export const toggleBranchCategory = createAsyncThunk<
  BranchCategoryItem,
  { branchId: string; categoryId: string; isActive: boolean },
  { rejectValue: string }
>(
  'branchCategory/toggleBranchCategory',
  async ({ branchId, categoryId, isActive }, { rejectWithValue }) => {
    try {
      const res = await branchCategoryService.toggle(branchId, categoryId, isActive);
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle category');
      }
      return rejectWithValue('Failed to toggle category');
    }
  },
);

export const fetchBranchCategoriesPaginated = createAsyncThunk<
  {
    data: BranchCategoryItem[];
    pagination: PaginationMetadata;
  },
  {
    branchId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
  },
  { rejectValue: string }
>(
  'branchCategory/fetchBranchCategoriesPaginated',
  async ({ branchId, page, limit, search, sortBy, sortOrder, isActive }, { rejectWithValue }) => {
    try {
      const res = await branchCategoryService.listPaginated(branchId, {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        isActive,
      });
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
      }
      return rejectWithValue('Failed to fetch categories');
    }
  },
);
