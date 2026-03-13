import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CouponState, Coupon } from './coupon.types';
import {
  fetchAllCoupons,
  fetchAvailableCoupons,
  createCoupon,
  validateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  updateCoupon,
} from './coupon.thunks';

const initialState: CouponState = {
  coupons: [],
  pagination: null,
  availableCoupons: [],
  activeCoupon: null,
  loading: false,
  error: null,
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearCouponError: (state) => {
      state.error = null;
    },
    clearActiveCoupon: (state) => {
      state.activeCoupon = null;
    },
    setActiveCoupon: (state, action: PayloadAction<Coupon>) => {
      state.activeCoupon = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Coupons
      .addCase(fetchAllCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action: PayloadAction<{ data: Coupon[]; pagination: any }>) => {
        state.loading = false;
        state.coupons = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Available Coupons
      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action: PayloadAction<Coupon[]>) => {
        state.loading = false;
        state.availableCoupons = action.payload;
      })
      .addCase(fetchAvailableCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Validate Coupon
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        state.activeCoupon = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        const index = state.coupons.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle Status
      .addCase(toggleCouponStatus.fulfilled, (state, action: PayloadAction<Coupon>) => {
        const index = state.coupons.findIndex(
          (c) => c.id === action.payload.id || c.id === action.payload.id,
        );
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      // Delete Coupon (Toggle)
      .addCase(deleteCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        const index = state.coupons.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      });
  },
});

export const { clearCouponError, clearActiveCoupon, setActiveCoupon } = couponSlice.actions;
export default couponSlice.reducer;
