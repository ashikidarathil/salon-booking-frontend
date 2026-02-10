import { createAsyncThunk } from '@reduxjs/toolkit';
import { branchServiceService } from '@/services/branchService.service';
import type { BranchServiceItem } from './branchService.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const fetchBranchServices = createAsyncThunk<
  BranchServiceItem[],
  string,
  { rejectValue: string }
>('branchService/fetchBranchServices', async (branchId, { rejectWithValue }) => {
  try {
    const res = await branchServiceService.list(branchId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const fetchBranchServicesPaginated = createAsyncThunk<
  {
    data: BranchServiceItem[];
    pagination: PaginationMetadata;
  },
  {
    branchId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    configured?: boolean;
    isActive?: boolean;
  },
  { rejectValue: string }
>(
  'branchService/fetchBranchServicesPaginated',
  async (params, { rejectWithValue }) => {
    try {
      const { branchId, ...rest } = params;
      const res = await branchServiceService.listPaginated(branchId, rest);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);

export const upsertBranchService = createAsyncThunk<
  BranchServiceItem,
  { branchId: string; serviceId: string; price: number; duration: number; isActive?: boolean },
  { rejectValue: string }
>(
  'branchService/upsertBranchService',
  async ({ branchId, serviceId, price, duration, isActive }, { rejectWithValue }) => {
    try {
      const res = await branchServiceService.upsert(branchId, serviceId, {
        price,
        duration,
        isActive,
      });
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);

export const toggleBranchServiceStatus = createAsyncThunk<
  BranchServiceItem,
  { branchId: string; serviceId: string; isActive: boolean },
  { rejectValue: string }
>(
  'branchService/toggleBranchServiceStatus',
  async ({ branchId, serviceId, isActive }, { rejectWithValue }) => {
    try {
      const res = await branchServiceService.toggleStatus(branchId, serviceId, isActive);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);

export const fetchBranchServicesPublicPaginated = createAsyncThunk<
  {
    data: BranchServiceItem[];
    pagination: PaginationMetadata;
  },
  {
    branchId: string;
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  },
  { rejectValue: string }
>(
  'branchService/fetchBranchServicesPublicPaginated',
  async (params, { rejectWithValue }) => {
    try {
      const { branchId, ...rest } = params;
      const res = await branchServiceService.listPublicPaginated(branchId, rest);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);

export const fetchBranchServicePublicDetails = createAsyncThunk<
  BranchServiceItem,
  { branchId: string; serviceId: string },
  { rejectValue: string }
>(
  'branchService/fetchBranchServicePublicDetails',
  async ({ branchId, serviceId }, { rejectWithValue }) => {
    try {
      const res = await branchServiceService.getPublic(branchId, serviceId);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);
