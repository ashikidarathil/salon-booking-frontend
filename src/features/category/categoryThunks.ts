import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { categoryService } from '@/services/category.service';
import type { Category, CategoryStatus } from './category.types';
import type { ApiResponse } from '@/common/types/api.types';

// =======================
// FETCH
// =======================
export const fetchCategories = createAsyncThunk<
  Category[],
  { includeDeleted?: boolean } | undefined,
  { rejectValue: string }
>('category/fetchCategories', async (payload, { rejectWithValue }) => {
  try {
    const res = await categoryService.listCategories(payload?.includeDeleted);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
    return rejectWithValue('Failed to fetch categories');
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
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
    return rejectWithValue('Failed to fetch categories');
  }
});

export const fetchPaginatedCategories = createAsyncThunk<
  {
    data: Category[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
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
    if (axios.isAxiosError(err)) {
      const apiResponse = err.response?.data as ApiResponse;

      const errorMessage = apiResponse?.message || 'Failed to fetch categories';

      return rejectWithValue(errorMessage);
    }
    return rejectWithValue('Failed to fetch categories');
  }
});

// =======================
// CREATE
// =======================
export const createCategory = createAsyncThunk<
  Category,
  { name: string; description?: string },
  { rejectValue: string }
>('category/createCategory', async (data, { rejectWithValue }) => {
  try {
    const res = await categoryService.createCategory(data);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const apiResponse = err.response?.data as ApiResponse;

      const errorMessage =
        apiResponse?.message ||
        apiResponse?.errors?.name?.[0] ||
        apiResponse?.errors?.description?.[0] ||
        'Failed to create category';

      return rejectWithValue(errorMessage);
    }
    return rejectWithValue('Failed to create category');
  }
});

// =======================
// UPDATE
// =======================
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
    if (axios.isAxiosError(err)) {
      const apiResponse = err.response?.data as ApiResponse;

      const errorMessage =
        apiResponse?.message ||
        Object.values(apiResponse?.errors || {})?.[0]?.[0] ||
        'Failed to update category';

      return rejectWithValue(errorMessage);
    }
    return rejectWithValue('Failed to update category');
  }
});

// =======================
// TOGGLE STATUS
// =======================
export const toggleCategoryStatus = createAsyncThunk<
  { id: string; status: CategoryStatus },
  { id: string; status: CategoryStatus },
  { rejectValue: string }
>('category/toggleCategoryStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    await categoryService.updateCategory(id, { status });
    return { id, status };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const apiResponse = err.response?.data as ApiResponse;

      const errorMessage = apiResponse?.message || 'Failed to toggle status';

      return rejectWithValue(errorMessage);
    }
    return rejectWithValue('Failed to toggle status');
  }
});

// =======================
// SOFT DELETE
// =======================
export const softDeleteCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  'category/softDeleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.softDeleteCategory(id);
      return id;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiResponse = err.response?.data as ApiResponse;

        const errorMessage = apiResponse?.message || 'Failed to delete category';

        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Failed to soft delete');
    }
  },
);

// =======================
// RESTORE
// =======================
export const restoreCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  'category/restoreCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.restoreCategory(id);
      return id;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiResponse = err.response?.data as ApiResponse;

        const errorMessage = apiResponse?.message || 'Failed to restore category';

        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Failed to restore');
    }
  },
);
