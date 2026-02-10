import { createAsyncThunk } from '@reduxjs/toolkit';
import { stylistBranchService } from '@/services/stylistBranch.service';
import type { BranchStylist, UnassignedStylist } from './stylistBranch.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const fetchBranchStylists = createAsyncThunk<
  BranchStylist[],
  string,
  { rejectValue: string }
>('stylistBranch/fetchBranchStylists', async (branchId, { rejectWithValue }) => {
  try {
    const res = await stylistBranchService.listBranchStylists(branchId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to fetch stylists');
  }
});

export const fetchBranchStylistsPaginated = createAsyncThunk<
  {
    data: BranchStylist[];
    pagination: PaginationMetadata;
  },
  {
    branchId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  { rejectValue: string }
>(
  'stylistBranch/fetchBranchStylistsPaginated',
  async ({ branchId, page, limit, search, sortBy, sortOrder }, { rejectWithValue }) => {
    try {
      const res = await stylistBranchService.listBranchStylistsPaginated(branchId, {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, 'Failed to fetch stylists');
    }
  },
);

export const fetchUnassignedStylists = createAsyncThunk<
  UnassignedStylist[],
  string,
  { rejectValue: string }
>('stylistBranch/fetchUnassignedStylists', async (branchId, { rejectWithValue }) => {
  try {
    const res = await stylistBranchService.listUnassignedOptions(branchId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to fetch options');
  }
});

export const fetchUnassignedStylistsPaginated = createAsyncThunk<
  {
    data: UnassignedStylist[];
    pagination: PaginationMetadata;
  },
  {
    branchId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  { rejectValue: string }
>(
  'stylistBranch/fetchUnassignedStylistsPaginated',
  async ({ branchId, page, limit, search, sortBy, sortOrder }, { rejectWithValue }) => {
    try {
      const res = await stylistBranchService.listUnassignedOptionsPaginated(branchId, {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, 'Failed to fetch options');
    }
  },
);

export const assignStylist = createAsyncThunk<
  BranchStylist,
  { branchId: string; stylistId: string },
  { rejectValue: string }
>('stylistBranch/assignStylist', async ({ branchId, stylistId }, { rejectWithValue }) => {
  try {
    const res = await stylistBranchService.assign(branchId, stylistId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to assign');
  }
});

export const unassignStylist = createAsyncThunk<
  { success: true },
  { branchId: string; stylistId: string },
  { rejectValue: string }
>('stylistBranch/unassignStylist', async ({ branchId, stylistId }, { rejectWithValue }) => {
  try {
    const res = await stylistBranchService.unassign(branchId, stylistId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to unassign');
  }
});

export const changeStylistBranch = createAsyncThunk<
  BranchStylist,
  { branchId: string; stylistId: string },
  { rejectValue: string }
>('stylistBranch/changeStylistBranch', async ({ branchId, stylistId }, { rejectWithValue }) => {
  try {
    const res = await stylistBranchService.changeBranch(branchId, stylistId);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to change branch');
  }
});
