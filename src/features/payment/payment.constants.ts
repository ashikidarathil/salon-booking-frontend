export const PAYMENT_MESSAGES = {
  CREATE_ORDER_FAILED: 'Failed to initiate payment. Please try again.',
  VERIFICATION_FAILED: 'Payment verification failed. Please contact support.',
  CHECKOUT_ERROR: 'An error occurred during checkout. Please try again.',
  SUCCESS: 'Payment successful! Your booking is confirmed.',
  WALLET_PAY_FAILED: 'Wallet payment failed',
  REMAINING_PAY_FAILED: 'Remaining payment processing failed',
  REMAINING_WALLET_FAILED: 'Wallet payment for remaining amount failed',
  REMAINING_SUCCESS: 'Remaining balance paid successfully.',
  REMAINING_WALLET_SUCCESS: 'Remaining balance paid via wallet.',
  RAZORPAY_LOAD_ERROR: 'Razorpay SDK failed to load',
};

export const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
