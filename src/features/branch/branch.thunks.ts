import { createAsyncThunk } from '@reduxjs/toolkit';
import { branchService } from '@/services/branch.service';
import type { Branch, NearestBranch, BranchQuery, PaginatedBranchResponse } from './branch.types';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const fetchBranches = createAsyncThunk<Branch[], undefined, { rejectValue: string }>(
  'branch/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const res = await branchService.list(true);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);

export const createBranch = createAsyncThunk<
  Branch,
  { name: string; address: string; phone?: string; latitude: number; longitude: number },
  { rejectValue: string }
>('branch/createBranch', async (data, { rejectWithValue }) => {
  try {
    const res = await branchService.create(data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.CREATE_FAILED);
  }
});

export const updateBranch = createAsyncThunk<
  Branch,
  {
    id: string;
    data: Partial<{
      name: string;
      address: string;
      phone?: string;
      latitude: number;
      longitude: number;
      defaultBreaks?: Array<{ startTime: string; endTime: string; description: string }>;
    }>;
  },
  { rejectValue: string }
>('branch/updateBranch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await branchService.update(id, data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const softDeleteBranch = createAsyncThunk<Branch, string, { rejectValue: string }>(
  'branch/disableBranch',
  async (id, { rejectWithValue }) => {
    try {
      const res = await branchService.softDelete(id);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DELETE_FAILED);
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
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);

export const fetchPaginatedBranches = createAsyncThunk<
  PaginatedBranchResponse,
  BranchQuery,
  { rejectValue: string }
>('branch/fetchPaginatedBranches', async (params, { rejectWithValue }) => {
  try {
    const res = await branchService.getPaginatedBranches(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const fetchPublicBranches = createAsyncThunk<Branch[], undefined, { rejectValue: string }>(
  'branch/fetchPublicBranches',
  async (_, { rejectWithValue }) => {
    try {
      const res = await branchService.listPublic();
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);

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
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);

export const fetchBranchById = createAsyncThunk<Branch, string, { rejectValue: string }>(
  'branch/fetchBranchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await branchService.getPublic(id);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);

export const fetchPublicPaginatedBranches = createAsyncThunk<
  PaginatedBranchResponse,
  {
    page?: number;
    limit?: number;
    search?: string;
  },
  { rejectValue: string }
>('branch/fetchPublicPaginatedBranches', async (params, { rejectWithValue }) => {
  try {
    const res = await branchService.listPublicPaginated(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});
