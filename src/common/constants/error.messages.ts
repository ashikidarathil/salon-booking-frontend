export const ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  DIFFERENT_TAB_ERROR: 'different tab',

  // Network errors
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timeout',

  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',

  // API errors
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
  FORBIDDEN: 'You do not have permission to access this resource',

  // User messages
  OPERATION_FAILED: 'Operation failed. Please try again.',
  DATA_LOAD_FAILED: 'Failed to load data',
  UPDATE_FAILED: 'Failed to update',
  DELETE_FAILED: 'Failed to delete',
  CREATE_FAILED: 'Failed to create',

  // Stylist specific
  STYLIST_INVITE_EXPIRED: 'Invite link has expired',
  STYLIST_ALREADY_INVITED: 'Stylist already invited / accepted / active',
  NOT_STYLIST_APPLICANT: 'User is not a stylist applicant',

  UPLOAD_PICTURE_FAILED: 'Failed to upload profile picture',
  UPDATE_PICTURE_FAILED: 'Failed to update profile picture',
  UPDATE_PROFILE_FAILED: 'Failed to update profile',
  CHANGE_PASSWORD_FAILED: 'Failed to change password',
  PASSWORD_MISMATCH: 'New password and confirm password do not match',

} as const;

export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
  DATA_SAVED: 'Data saved successfully',
  UPDATE_SUCCESSFUL: 'Updated successfully',
  DELETE_SUCCESSFUL: 'Deleted successfully',
  CREATE_SUCCESSFUL: 'Created successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGOUT_SUCCESSFUL: 'Logout successful',
} as const;
