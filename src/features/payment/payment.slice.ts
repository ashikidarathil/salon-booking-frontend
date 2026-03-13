import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PaymentState, OrderResponse } from './payment.types';
import {
  createPaymentOrder,
  verifyPayment,
  payWithWallet,
  processRazorpayPayment,
} from './payment.thunks';

const initialState: PaymentState = {
  currentOrder: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    resetPayment: (state) => {
      state.currentOrder = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.loading = false;
        state.currentOrder = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Pay with Wallet
      .addCase(payWithWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payWithWallet.fulfilled, (state) => {
        state.loading = false;
        state.currentOrder = null;
      })
      .addCase(payWithWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Process Razorpay
      .addCase(processRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRazorpayPayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(processRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPaymentError, resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
