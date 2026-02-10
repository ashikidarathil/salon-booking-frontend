import { createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '@/services/category.service';
import type { Category, CategoryStatus } from './category.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';

export const fetchCategories = createAsyncThunk<
  Category[],
  { includeDeleted?: boolean } | undefined,
  { rejectValue: string }
>('category/fetchCategories', async (payload, { rejectWithValue }) => {
  try {
    const res = await categoryService.listCategories(payload?.includeDeleted);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const fetchPublicCategories = createAsyncThunk<
  Category[],
  undefined,
  { rejectValue: string }
>('category/fetchPublicCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await categoryService.listPublic();
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const fetchPaginatedCategories = createAsyncThunk<
  {
    data: Category[];
    pagination: PaginationMetadata;
  },
  {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: 'ACTIVE' | 'INACTIVE';
    isDeleted?: boolean;
  },
  { rejectValue: string }
>('category/fetchPaginatedCategories', async (params, { rejectWithValue }) => {
  try {
    const res = await categoryService.getPaginatedCategories(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const createCategory = createAsyncThunk<
  Category,
  { name: string; description?: string },
  { rejectValue: string }
>('category/createCategory', async (data, { rejectWithValue }) => {
  try {
    const res = await categoryService.createCategory(data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.CREATE_FAILED);
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  {
    id: string;
    data: Partial<{
      name: string;
      description?: string;
      status?: CategoryStatus;
    }>;
  },
  { rejectValue: string }
>('category/updateCategory', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await categoryService.updateCategory(id, data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const toggleCategoryStatus = createAsyncThunk<
  { id: string; status: CategoryStatus },
  { id: string; status: CategoryStatus },
  { rejectValue: string }
>('category/toggleCategoryStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    await categoryService.updateCategory(id, { status });
    return { id, status };
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
  }
});

export const softDeleteCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  'category/softDeleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.softDeleteCategory(id);
      return id;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DELETE_FAILED);
    }
  },
);

export const restoreCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  'category/restoreCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.restoreCategory(id);
      return id;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);
