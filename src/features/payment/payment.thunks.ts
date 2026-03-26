import { createAsyncThunk } from '@reduxjs/toolkit';
import PaymentService from '../../services/payment.service';
import { handleThunkError } from '../../common/utils/thunk.utils';
import { loadRazorpayScript } from '../../common/utils/razorpay.utils';
import { PAYMENT_MESSAGES } from './payment.constants';
import type { OrderResponse, Payment, PaymentVerificationDto } from './payment.types';

const PM = PAYMENT_MESSAGES;

export const createPaymentOrder = createAsyncThunk<OrderResponse, string, { rejectValue: string }>(
  'payment/createOrder',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await PaymentService.createOrder(bookingId);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, PM.CREATE_ORDER_FAILED);
    }
  },
);

export const verifyPayment = createAsyncThunk<
  Payment,
  PaymentVerificationDto,
  { rejectValue: string }
>('payment/verify', async (data, { rejectWithValue }) => {
  try {
    return await PaymentService.verifyPayment(data);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, PM.VERIFICATION_FAILED);
  }
});

export const payWithWallet = createAsyncThunk<
  Payment,
  { bookingId: string },
  { rejectValue: string }
>('payment/payWithWallet', async ({ bookingId }, { rejectWithValue }) => {
  try {
    return await PaymentService.payWithWallet(bookingId);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, PM.WALLET_PAY_FAILED);
  }
});

export const processRazorpayPayment = createAsyncThunk<
  { status: 'success' | 'cancelled' },
  { bookingId: string },
  { rejectValue: string }
>('payment/processRazorpay', async ({ bookingId }, { dispatch, rejectWithValue }) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      return rejectWithValue(PM.RAZORPAY_LOAD_ERROR);
    }

    const resultAction = await dispatch(createPaymentOrder(bookingId));
    if (createPaymentOrder.rejected.match(resultAction)) {
      return rejectWithValue(resultAction.payload as string);
    }

    const order = resultAction.payload;

    return await new Promise<{ status: 'success' | 'cancelled' }>((resolve, reject) => {
      let paymentFailed = false;
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Saloon Booking',
        description: '20% Advance Payment',
        order_id: order.orderId,
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          dispatch(
            verifyPayment({
              orderId: order.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              bookingId,
            }),
          )
            .then((verifyAction) => {
              if (verifyPayment.fulfilled.match(verifyAction)) {
                resolve({ status: 'success' });
              } else {
                reject(new Error((verifyAction.payload as string) || PM.VERIFICATION_FAILED));
              }
            })
            .catch((err) => {
              reject(err);
            });
        },
        theme: { color: '#F87171' },
        modal: {
          ondismiss: () => {
            if (paymentFailed) {
              reject(new Error('Payment failed'));
            } else {
              resolve({ status: 'cancelled' });
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        paymentFailed = true;
      });
      rzp.open();
    });
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue, PM.CHECKOUT_ERROR);
  }
});

export const payRemainingWithWallet = createAsyncThunk<
  Payment,
  { bookingId: string },
  { rejectValue: string }
>('payment/payRemainingWithWallet', async ({ bookingId }, { rejectWithValue }) => {
  try {
    return await PaymentService.payRemainingWithWallet(bookingId);
  } catch (error) {
    return handleThunkError(error, rejectWithValue, PM.REMAINING_WALLET_FAILED);
  }
});

export const processRemainingPayment = createAsyncThunk<
  { status: 'success' | 'cancelled' },
  { bookingId: string },
  { rejectValue: string }
>('payment/processRemainingRazorpay', async ({ bookingId }, { dispatch, rejectWithValue }) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) return rejectWithValue(PM.RAZORPAY_LOAD_ERROR);

    const order = await PaymentService.createRemainingOrder(bookingId);

    return await new Promise<{ status: 'success' | 'cancelled' }>((resolve, reject) => {
      let paymentFailed = false;

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Saloon Booking',
        description: 'Remaining Balance Payment (80%)',
        order_id: order.orderId,
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          dispatch(
            verifyPayment({
              orderId: order.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              bookingId,
            }),
          )
            .then((verifyAction) => {
              if (verifyPayment.fulfilled.match(verifyAction)) resolve({ status: 'success' });
              else reject(new Error((verifyAction.payload as string) || PM.VERIFICATION_FAILED));
            })
            .catch(reject);
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => {
            if (paymentFailed) reject(new Error('Payment failed'));
            else resolve({ status: 'cancelled' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        paymentFailed = true;
      });
      rzp.open();
    });
  } catch (error: unknown) {
    return handleThunkError(error, rejectWithValue, PM.REMAINING_PAY_FAILED);
  }
});
