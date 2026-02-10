import { createAsyncThunk } from '@reduxjs/toolkit';
import { branchCategoryService } from '@/services/branchCategory.service';
import type { BranchCategoryItem } from './branchCategory.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const fetchBranchCategories = createAsyncThunk<
  BranchCategoryItem[],
  string,
  { rejectValue: string }
>('branchCategory/fetchBranchCategories', async (branchId, { rejectWithValue }) => {
  try {
    const res = await branchCategoryService.list(branchId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
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
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
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
  async (params, { rejectWithValue }) => {
    try {
      const { branchId, ...rest } = params;
      const res = await branchCategoryService.listPaginated(branchId, rest);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);
