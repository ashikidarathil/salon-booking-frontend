// src/features/branch/branch.thunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { branchService } from '@/services/branch.service';
import type { Branch, NearestBranch } from './branch.types';

export const fetchBranches = createAsyncThunk<Branch[], undefined, { rejectValue: string }>(
  'branch/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const res = await branchService.list(true);
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch branches');
      }
      return rejectWithValue('Failed to fetch branches');
    }
  },
);

export const createBranch = createAsyncThunk<
  Branch,
  { name: string; address: string; phone?: string },
  { rejectValue: string }
>('branch/createBranch', async (data, { rejectWithValue }) => {
  try {
    const res = await branchService.create(data);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create branch');
    }
    return rejectWithValue('Failed to create branch');
  }
});

export const updateBranch = createAsyncThunk<
  Branch,
  { id: string; data: Partial<{ name: string; address: string; phone?: string }> },
  { rejectValue: string }
>('branch/updateBranch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await branchService.update(id, data);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update branch');
    }
    return rejectWithValue('Failed to update branch');
  }
});

export const softDeleteBranch = createAsyncThunk<Branch, string, { rejectValue: string }>(
  'branch/disableBranch',
  async (id, { rejectWithValue }) => {
    try {
      const res = await branchService.softDelete(id);
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to disable branch');
      }
      return rejectWithValue('Failed to disable branch');
    }
  },
);

export const restoreBranch = createAsyncThunk<Branch, string, { rejectValue: string }>(
  'branch/restoreBranch',
  async (id, { rejectWithValue }) => {
    try {
      const res = await branchService.restore(id);
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to restore branch');
      }
      return rejectWithValue('Failed to restore branch');
    }
  },
);

export const fetchPaginatedBranches = createAsyncThunk<
  {
    data: Branch[];
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
    isDeleted?: boolean;
  },
  { rejectValue: string }
>('branch/fetchPaginatedBranches', async (params, { rejectWithValue }) => {
  try {
    const res = await branchService.getPaginatedBranches(params);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch branches');
    }
    return rejectWithValue('Failed to fetch branches');
  }
});

// export const fetchNearestBranches = createAsyncThunk<
//   NearestBranch[],
//   { latitude: number; longitude: number },
//   { rejectValue: string }
// >('branch/fetchNearestBranches', async ({ latitude, longitude }, { rejectWithValue }) => {
//   try {
//     const res = await branchService.getNearestBranches(latitude, longitude);
//     return res.data.data;
//   } catch (err) {
//     if (axios.isAxiosError(err)) {
//       return rejectWithValue(err.response?.data?.message || 'Failed to fetch nearest branches');
//     }
//     return rejectWithValue('Failed to fetch nearest branches');
//   }
// });

export const fetchPublicBranches = createAsyncThunk<Branch[], undefined, { rejectValue: string }>(
  'branch/fetchPublicBranches',
  async (_, { rejectWithValue }) => {
    try {
      const res = await branchService.listPublic();
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch branches');
      }
      return rejectWithValue('Failed to fetch branches');
    }
  },
);

// ✅ NEW: Fetch nearest branches (geolocation)
export const fetchNearestBranches = createAsyncThunk<
  NearestBranch[],
  { latitude: number; longitude: number; maxDistance?: number },
  { rejectValue: string }
>(
  'branch/fetchNearestBranches',
  async ({ latitude, longitude, maxDistance }, { rejectWithValue }) => {
    try {
      const res = await branchService.getNearestBranches(latitude, longitude, maxDistance);
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch nearest branches');
      }
      return rejectWithValue('Failed to fetch nearest branches');
    }
  },
);

// ✅ NEW: Get single branch details
export const fetchBranchById = createAsyncThunk<Branch, string, { rejectValue: string }>(
  'branch/fetchBranchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await branchService.getPublic(id);
      return res.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch branch');
      }
      return rejectWithValue('Failed to fetch branch');
    }
  },
);
