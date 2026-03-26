export const WALLET_MESSAGES = {
  FETCH_WALLET_ERROR: 'Failed to fetch wallet information',
  FETCH_TRANSACTIONS_ERROR: 'Failed to fetch transaction history',
  CREDIT_ERROR: 'Failed to credit wallet',
  TOPUP_ERROR: 'Failed to process top-up',
  PAYMENT_FAILED: 'Payment failed or was cancelled',
  RAZORPAY_LOAD_ERROR: 'Razorpay SDK failed to load',
};

export const WALLET_CONSTANTS = {
  DEFAULT_THEME_COLOR: '#F87171', // Red matching index.css --primary
  STYLIST_THEME_COLOR: '#3B82F6', // Blue matching index.css --primary
  ADMIN_THEME_COLOR: '#10B981', // Emerald matching index.css --primary
  CURRENCY: 'INR',
  COMPANY_NAME: 'Saloon Booking',
};

export const getThemeColorByRole = (role?: string) => {
  switch (role) {
    case 'STYLIST':
      return WALLET_CONSTANTS.STYLIST_THEME_COLOR;
    case 'ADMIN':
      return WALLET_CONSTANTS.ADMIN_THEME_COLOR;
    default:
      return WALLET_CONSTANTS.DEFAULT_THEME_COLOR;
  }
};
