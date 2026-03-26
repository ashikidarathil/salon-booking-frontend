import { createAsyncThunk } from '@reduxjs/toolkit';
import CouponService from '../../services/coupon.service';
import type { CreateCouponRequest, CouponQuery, PaginatedCouponResponse } from './coupon.types';
import { handleThunkError } from '../../common/utils/thunk.utils';
import { COUPON_MESSAGES } from './coupon.constants';

export const fetchAllCoupons = createAsyncThunk<
  PaginatedCouponResponse,
  CouponQuery | undefined,
  { rejectValue: string }
>('coupon/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await CouponService.listAllCoupons(params);
    return response.data.data;
  } catch (error) {
    return handleThunkError(error, rejectWithValue, COUPON_MESSAGES.FETCH_ERROR);
  }
});

export const fetchAvailableCoupons = createAsyncThunk(
  'coupon/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CouponService.listAvailableCoupons();
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, COUPON_MESSAGES.FETCH_ERROR);
    }
  },
);

export const createCoupon = createAsyncThunk(
  'coupon/create',
  async (data: CreateCouponRequest, { rejectWithValue }) => {
    try {
      const response = await CouponService.createCoupon(data);
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, COUPON_MESSAGES.CREATE_ERROR);
    }
  },
);

export const updateCoupon = createAsyncThunk(
  'coupon/update',
  async ({ id, data }: { id: string; data: Partial<CreateCouponRequest> }, { rejectWithValue }) => {
    try {
      const response = await CouponService.updateCoupon(id, data);
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, 'Failed to update coupon');
    }
  },
);

export const validateCoupon = createAsyncThunk(
  'coupon/validate',
  async ({ code, amount }: { code: string; amount: number }, { rejectWithValue }) => {
    try {
      const response = await CouponService.validateCoupon(code, amount);
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, COUPON_MESSAGES.VALIDATE_ERROR);
    }
  },
);

export const toggleCouponStatus = createAsyncThunk(
  'coupon/toggleStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await CouponService.toggleStatus(id);
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, COUPON_MESSAGES.TOGGLE_ERROR);
    }
  },
);

export const deleteCoupon = createAsyncThunk(
  'coupon/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await CouponService.deleteCoupon(id);
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, COUPON_MESSAGES.DELETE_ERROR);
    }
  },
);
