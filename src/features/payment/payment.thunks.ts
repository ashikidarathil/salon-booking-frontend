import { createAsyncThunk } from '@reduxjs/toolkit';
import PaymentService from '../../services/payment.service';
import { handleThunkError } from '../../common/utils/thunk.utils';
import { loadRazorpayScript } from '../../common/utils/razorpay.utils';

export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await PaymentService.createOrder(bookingId);
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, 'Failed to create payment order');
    }
  },
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (data: { orderId: string; paymentId: string; signature: string }, { rejectWithValue }) => {
    try {
      const response = await PaymentService.verifyPayment(data);
      return response.data.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, 'Payment verification failed');
    }
  },
);

export const payWithWallet = createAsyncThunk(
  'payment/payWithWallet',
  async ({ bookingId }: { bookingId: string }, { rejectWithValue }) => {
    try {
      const response = await PaymentService.payWithWallet(bookingId);
      return response.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, 'Wallet payment failed');
    }
  },
);

export const processRazorpayPayment = createAsyncThunk<
  { status: 'success' | 'cancelled' },
  { bookingId: string },
  { rejectValue: string }
>('payment/processRazorpay', async ({ bookingId }, { dispatch, rejectWithValue }) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      return rejectWithValue('Razorpay SDK failed to load');
    }

    const resultAction = await dispatch(createPaymentOrder(bookingId));
    if (createPaymentOrder.rejected.match(resultAction)) {
      return rejectWithValue(resultAction.payload as string);
    }

    const order = resultAction.payload;

    return await new Promise<{ status: 'success' | 'cancelled' }>((resolve, reject) => {
      let paymentFailed = false; // tracks whether card/UPI was actually declined

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Saloon Booking',
        description: '20% Advance Payment',
        order_id: order.orderId,
        handler: (response: any) => {
          // Verify asynchronously but resolve/reject via the Promise
          dispatch(
            verifyPayment({
              orderId: order.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          )
            .then((verifyAction) => {
              if (verifyPayment.fulfilled.match(verifyAction)) {
                resolve({ status: 'success' });
              } else {
                reject(new Error((verifyAction.payload as string) || 'Verification failed'));
              }
            })
            .catch((err) => {
              reject(err);
            });
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => {
            if (paymentFailed) {
              // Card was declined — navigate to failure page
              reject(new Error('Payment failed'));
            } else {
              // User voluntarily closed the modal — stay on checkout
              resolve({ status: 'cancelled' });
            }
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (_response: any) => {
        paymentFailed = true;
        // Don't reject here — wait for ondismiss to settle the promise
      });
      rzp.open();
    });
  } catch (error: any) {
    return rejectWithValue(error.message || 'Payment processing failed');
  }
});

export const payRemainingWithWallet = createAsyncThunk(
  'payment/payRemainingWithWallet',
  async ({ bookingId }: { bookingId: string }, { rejectWithValue }) => {
    try {
      const response = await PaymentService.payRemainingWithWallet(bookingId);
      return response.data;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, 'Wallet payment for remaining amount failed');
    }
  },
);

export const processRemainingPayment = createAsyncThunk<
  { status: 'success' | 'cancelled' },
  { bookingId: string },
  { rejectValue: string }
>('payment/processRemainingRazorpay', async ({ bookingId }, { dispatch, rejectWithValue }) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) return rejectWithValue('Razorpay SDK failed to load');

    const orderRes = await PaymentService.createRemainingOrder(bookingId);
    const order = orderRes.data.data;

    return await new Promise<{ status: 'success' | 'cancelled' }>((resolve, reject) => {
      let paymentFailed = false;

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Saloon Booking',
        description: 'Remaining Balance Payment (80%)',
        order_id: order.orderId,
        handler: (response: any) => {
          dispatch(
            verifyPayment({
              orderId: order.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          )
            .then((verifyAction) => {
              if (verifyPayment.fulfilled.match(verifyAction)) resolve({ status: 'success' });
              else reject(new Error((verifyAction.payload as string) || 'Verification failed'));
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

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', () => {
        paymentFailed = true;
      });
      rzp.open();
    });
  } catch (error: any) {
    return rejectWithValue(error.message || 'Remaining payment processing failed');
  }
});
