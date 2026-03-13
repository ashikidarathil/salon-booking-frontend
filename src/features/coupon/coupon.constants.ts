export const COUPON_MESSAGES = {
  FETCH_ERROR: 'Failed to fetch coupons',
  CREATE_ERROR: 'Failed to create coupon',
  VALIDATE_ERROR: 'Failed to validate coupon',
  TOGGLE_ERROR: 'Failed to update coupon status',
  DELETE_ERROR: 'Failed to delete coupon',
  INVALID_CODE: 'Please enter a valid coupon code',
  MIN_AMOUNT_ERROR: (min: number) => `Minimum booking amount is ${min}`,
};
