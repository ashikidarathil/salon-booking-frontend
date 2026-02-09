export const API_ROUTES = {
  // Auth routes
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    VERIFY_SMS_OTP: '/auth/sms/verify-signup-otp',
    RESEND_EMAIL_OTP: '/auth/resend-email-otp',
    RESEND_SMS_OTP: '/auth/resend-sms-otp',
    RESEND_RESET_OTP: '/auth/resend-reset-otp',
    VERIFY_RESET_OTP: '/auth/verify-reset-otp',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Profile routes
  PROFILE: {
    UPLOAD_PICTURE: '/auth/profile/upload-picture',
    UPDATE_PICTURE: '/auth/profile/update-picture',
    UPDATE_PROFILE: '/auth/profile/update',
    CHANGE_PASSWORD: '/auth/profile/change-password',
  },

  // Stylist Invite routes
  STYLIST_INVITE: {
    CREATE_INVITE: '/admin/stylists/invite',
    PAGINATED: '/admin/stylists/paginated',
    LIST_STYLISTS: '/admin/stylists',
    VALIDATE_INVITE: '/stylists/invite/:token',
    ACCEPT_INVITE: '/stylists/invite/:token/accept',
    APPROVE_STYLIST: '/admin/stylists/:userId/approve',
    REJECT_STYLIST: '/admin/stylists/:userId/reject',
    SEND_INVITE_TO_APPLIED: '/admin/stylists/:userId/send-invite',
    TOGGLE_BLOCK: '/admin/stylists/:userId/block',
    TOGGLE_BLOCK_NEW: '/admin/stylists/:stylistId/block',
    APPLY_STYLIST: '/apply-stylist',
  },

  // User management routes
  USER: {
    GET_ALL_USERS: '/admin/users',
    TOGGLE_BLOCK: (userId: string) => `/admin/users/${userId}/block`,
    GET_USERS: '/admin/users',
  },

  CATEGORY: {
    PUBLIC_LIST: '/categories',
    ADMIN_LIST: '/admin/categories',
    CREATE: '/admin/categories',
    UPDATE: '/admin/categories/:id',
    SOFT_DELETE: '/admin/categories/:id/delete',
    RESTORE: '/admin/categories/:id/restore',
  },

  SERVICE: {
    PUBLIC_LIST: '/services',
    ADMIN_LIST: '/admin/services',
    CREATE: '/admin/services',
    UPDATE: '/admin/services/:id',
    SOFT_DELETE: '/admin/services/:id/delete',
    RESTORE: '/admin/services/:id/restore',
    UPLOAD_IMAGE: '/admin/services/:id/upload-image',
    DELETE_IMAGE: '/admin/services/:id/delete-image',
  },

  BRANCH: {
    BASE: '/admin/branches',
    BASE_NEW: '/admin/branches/paginated',
    BY_ID: (id: string) => `/admin/branches/${id}`,
    SOFT_DELETE: (id: string) => `/admin/branches/${id}/disable`,
    RESTORE: (id: string) => `/admin/branches/${id}/restore`,
  },

  STYLIST_BRANCH: {
    ADMIN: {
      LIST_BRANCH_STYLISTS: (branchId: string) => `/admin/branches/${branchId}/stylists`,
      LIST_BRANCH_STYLISTS_PAGINATED: (branchId: string) =>
        `/admin/branches/${branchId}/stylists/paginated`,
      OPTIONS_UNASSIGNED: (branchId: string) => `/admin/branches/${branchId}/stylists/options`,
      OPTIONS_UNASSIGNED_PAGINATED: (branchId: string) =>
        `/admin/branches/${branchId}/stylists/options/paginated`, // ✅ NEW
      ASSIGN: (branchId: string) => `/admin/branches/${branchId}/stylists/assign`,
      UNASSIGN: (branchId: string) => `/admin/branches/${branchId}/stylists/unassign`,
      CHANGE_BRANCH: (branchId: string) => `/admin/branches/${branchId}/stylists/change`,
    },
  },

  BRANCH_CATEGORY: {
    ADMIN: {
      LIST: (branchId: string) => `/admin/branches/${branchId}/categories`,
      TOGGLE: (branchId: string, categoryId: string) =>
        `/admin/branches/${branchId}/categories/${categoryId}`,
      LIST_PAGINATED: (branchId: string) => `/admin/branches/${branchId}/categories/paginated`,
    },
  },
  BRANCH_SERVICE: {
    ADMIN: {
      LIST: (branchId: string) => `/admin/branches/${branchId}/services`,
      LIST_PAGINATED: (branchId: string) => `/admin/branches/${branchId}/services/paginated`,
      UPSERT: (branchId: string, serviceId: string) =>
        `/admin/branches/${branchId}/services/${serviceId}`,
      TOGGLE_STATUS: (branchId: string, serviceId: string) =>
        `/admin/branches/${branchId}/services/${serviceId}/status`,
    },
  },
} as const;
