import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { branchServiceService } from '@/services/branchService.service';
import type { BranchServiceItem } from './branchService.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export const fetchBranchServices = createAsyncThunk<
  BranchServiceItem[],
  string,
  { rejectValue: string }
>('branchService/fetchBranchServices', async (branchId, { rejectWithValue }) => {
  try {
    const res = await branchServiceService.list(branchId);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch services');
    }
    return rejectWithValue('Failed to fetch services');
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
  async (
    { branchId, page, limit, search, sortBy, sortOrder, configured, isActive },
    { rejectWithValue },
  ) => {
    try {
      const res = await branchServiceService.listPaginated(branchId, {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        configured,
        isActive,
      });
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch services');
      }
      return rejectWithValue('Failed to fetch services');
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
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to upsert service');
      }
      return rejectWithValue('Failed to upsert service');
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
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle status');
      }
      return rejectWithValue('Failed to toggle status');
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
  async ({ branchId, page, limit, search, categoryId }, { rejectWithValue }) => {
    try {
      const res = await branchServiceService.listPublicPaginated(branchId, {
        page,
        limit,
        search,
        categoryId,
      });
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch services');
      }
      return rejectWithValue('Failed to fetch services');
    }
  },
);

// ✅ NEW: Fetch service details for specific branch (public)
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
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch service details');
      }
      return rejectWithValue('Failed to fetch service details');
    }
  },
);
