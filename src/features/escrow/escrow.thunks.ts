import { createAsyncThunk } from '@reduxjs/toolkit';
import escrowService from './escrow.service';
import type { PaginationQueryDto, PaginatedEscrowResponse } from './escrow.types';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { ESCROW_MESSAGES } from './escrow.constants';

export const fetchStylistEscrows = createAsyncThunk<
  PaginatedEscrowResponse,
  PaginationQueryDto,
  { rejectValue: string }
>('escrow/fetchStylistEscrows', async (query, { rejectWithValue }) => {
  try {
    return await escrowService.getStylistEscrows(query);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, ESCROW_MESSAGES.STYLIST_FETCH_ERROR);
  }
});

export const fetchHeldBalance = createAsyncThunk<number, void, { rejectValue: string }>(
  'escrow/fetchHeldBalance',
  async (_, { rejectWithValue }) => {
    try {
      return await escrowService.getHeldBalance();
    } catch (error) {
      return handleThunkError(error, rejectWithValue, ESCROW_MESSAGES.BALANCE_FETCH_ERROR);
    }
  },
);

export const fetchAdminEscrows = createAsyncThunk<
  PaginatedEscrowResponse,
  PaginationQueryDto,
  { rejectValue: string }
>('escrow/fetchAdminEscrows', async (query, { rejectWithValue }) => {
  try {
    return await escrowService.getAllEscrows(query);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, ESCROW_MESSAGES.ADMIN_FETCH_ERROR);
  }
});

export const fetchAdminStylistEscrows = createAsyncThunk<
  PaginatedEscrowResponse,
  { stylistId: string; query: PaginationQueryDto },
  { rejectValue: string }
>('escrow/fetchAdminStylistEscrows', async ({ stylistId, query }, { rejectWithValue }) => {
  try {
    return await escrowService.getAdminStylistEscrows(stylistId, query);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, ESCROW_MESSAGES.STYLIST_FETCH_ERROR);
  }
});

export const fetchAdminStylistHeldBalance = createAsyncThunk<
  number,
  string,
  { rejectValue: string }
>('escrow/fetchAdminStylistHeldBalance', async (stylistId, { rejectWithValue }) => {
  try {
    return await escrowService.getAdminStylistHeldBalance(stylistId);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, ESCROW_MESSAGES.BALANCE_FETCH_ERROR);
  }
});
