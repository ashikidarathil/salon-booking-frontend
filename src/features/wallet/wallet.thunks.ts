import { createAsyncThunk } from '@reduxjs/toolkit';
import WalletService from '../../services/wallet.service';
import { handleThunkError } from '../../common/utils/thunk.utils';
import { loadRazorpayScript } from '../../common/utils/razorpay.utils';
import type { WalletResponse, WalletTransaction, VerifyTopupPayload } from './wallet.types';
import { WALLET_MESSAGES, WALLET_CONSTANTS } from './wallet.constants';

export const fetchMyWallet = createAsyncThunk<WalletResponse, void, { rejectValue: string }>(
  'wallet/fetchMyWallet',
  async (_, { rejectWithValue }) => {
    try {
      return await WalletService.getMyWallet();
    } catch (err) {
      return handleThunkError(err, rejectWithValue, WALLET_MESSAGES.FETCH_WALLET_ERROR);
    }
  },
);

export const fetchTransactionHistory = createAsyncThunk<WalletTransaction[], void, { rejectValue: string }>(
  'wallet/fetchTransactionHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await WalletService.getTransactionHistory();
    } catch (err) {
      return handleThunkError(err, rejectWithValue, WALLET_MESSAGES.FETCH_TRANSACTIONS_ERROR);
    }
  },
);

export const creditWallet = createAsyncThunk<
  WalletResponse,
  { amount: number; description: string },
  { rejectValue: string }
>(
  'wallet/creditWallet',
  async ({ amount, description }, { rejectWithValue }) => {
    try {
      return await WalletService.creditWallet(amount, description);
    } catch (err) {
      return handleThunkError(err, rejectWithValue, WALLET_MESSAGES.CREDIT_ERROR);
    }
  },
);

export const topUpWallet = createAsyncThunk<
  WalletResponse,
  { amount: number; themeColor?: string },
  { rejectValue: string }
>('wallet/topUp', async ({ amount, themeColor }, { rejectWithValue }) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) return rejectWithValue(WALLET_MESSAGES.RAZORPAY_LOAD_ERROR);

    const order = await WalletService.createTopupOrder(amount);

    return await new Promise<WalletResponse>((resolve, reject) => {
      let paymentFailed = false;

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: WALLET_CONSTANTS.COMPANY_NAME,
        description: 'Wallet Top-Up',
        order_id: order.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const payload: VerifyTopupPayload = {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            };
            const verifyRes = await WalletService.verifyTopup(payload);
            resolve(verifyRes);
          } catch (err) {
            reject(err);
          }
        },
        theme: { color: themeColor || WALLET_CONSTANTS.DEFAULT_THEME_COLOR },
        modal: {
          ondismiss: () => {
            if (paymentFailed) reject(new Error(WALLET_MESSAGES.PAYMENT_FAILED));
            else reject(new Error('DISMISSED'));
          },
        },
      };

      const RazorpayCtor = (window as any).Razorpay;
      if (!RazorpayCtor) {
        reject(new Error(WALLET_MESSAGES.RAZORPAY_LOAD_ERROR));
        return;
      }

      const rzp = new RazorpayCtor(options);
      rzp.on('payment.failed', () => {
        paymentFailed = true;
      });
      rzp.open();
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'DISMISSED') return rejectWithValue('DISMISSED');
    return rejectWithValue(err.message || WALLET_MESSAGES.TOPUP_ERROR);
  }
});
