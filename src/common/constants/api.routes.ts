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
    UPDATE_POSITION: '/admin/stylists/:stylistId/position',
    APPLY_STYLIST: '/apply-stylist',
    PUBLIC_LIST: '/stylists',
    PUBLIC_BY_ID: (id: string) => `/stylists/${id}`,
  },

  STYLIST_SERVICE: {
    ADMIN: {
      LIST: (stylistId: string) => `/admin/stylists/${stylistId}/services`,
      LIST_PAGINATED: (stylistId: string) => `/admin/stylists/${stylistId}/services/paginated`,
      TOGGLE_STATUS: (stylistId: string, serviceId: string) =>
        `/admin/stylists/${stylistId}/services/${serviceId}/status`,
    },
    PUBLIC: {
      STYLISTS_BY_SERVICE: (serviceId: string) => `/public/services/${serviceId}/stylists`,
      LIST_BY_STYLIST: (stylistId: string) => `/stylists/${stylistId}/services`,
    },
  },

  // User management routes
  USER: {
    GET_ALL_USERS: '/admin/users',
    TOGGLE_BLOCK: (userId: string) => `/admin/users/${userId}/block`,
    GET_USERS: '/admin/users',
    DASHBOARD: {
      STATS: '/admin/dashboard/stats',
    },
  },

  CATEGORY: {
    PUBLIC_LIST: '/categories',
    ADMIN_LIST: '/admin/categories',
    CREATE: '/admin/categories',
    UPDATE: '/admin/categories/:id',
    SOFT_DELETE: '/admin/categories/:id/delete',
    RESTORE: '/admin/categories/:id/restore',
    PAGINATED: '/admin/categories/paginated',
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
    PAGINATED: '/admin/services/paginated',
    PUBLIC_BY_ID: (id: string) => `/services/${id}`,
    PUBLIC_PAGINATED: '/services/paginated',
  },

  BRANCH: {
    BASE: '/admin/branches',
    ADMIN_PAGINATED: '/admin/branches/paginated',
    BY_ID: (id: string) => `/admin/branches/${id}`,
    SOFT_DELETE: (id: string) => `/admin/branches/${id}/disable`,
    RESTORE: (id: string) => `/admin/branches/${id}/restore`,
    PUBLIC_NEAREST: '/branches/nearest',
    PUBLIC_LIST: '/branches',
    PUBLIC_PAGINATED: '/branches/paginated',
    PUBLIC_BY_ID: (id: string) => `/branches/${id}`,
  },

  STYLIST_BRANCH: {
    ADMIN: {
      LIST_BRANCH_STYLISTS: (branchId: string) => `/admin/branches/${branchId}/stylists`,
      LIST_BRANCH_STYLISTS_PAGINATED: (branchId: string) =>
        `/admin/branches/${branchId}/stylists/paginated`,
      OPTIONS_UNASSIGNED: (branchId: string) => `/admin/branches/${branchId}/stylists/options`,
      OPTIONS_UNASSIGNED_PAGINATED: (branchId: string) =>
        `/admin/branches/${branchId}/stylists/options/paginated`,
      ASSIGN: (branchId: string) => `/admin/branches/${branchId}/stylists/assign`,
      UNASSIGN: (branchId: string) => `/admin/branches/${branchId}/stylists/unassign`,
      CHANGE_BRANCH: (branchId: string) => `/admin/branches/${branchId}/stylists/change`,
    },
    PUBLIC: {
      LIST_BRANCH_STYLISTS: (branchId: string) => `/branches/${branchId}/stylists`,
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
    PUBLIC: {
      LIST_PAGINATED: (branchId: string) => `/branches/${branchId}/services/paginated`,
      BY_ID: (branchId: string, serviceId: string) => `/branches/${branchId}/services/${serviceId}`,
    },
  },
  SCHEDULE: {
    WEEKLY: (day: number) => `/schedules/weekly/${day}`,
    BY_STYLIST_WEEKLY: (stylistId: string) => `/schedules/stylists/${stylistId}/weekly`,
    DAILY: '/schedules/daily',
    BY_STYLIST_DAILY: (stylistId: string) => `/schedules/stylists/${stylistId}/daily`,
    DAILY_BY_ID: (id: string) => `/schedules/daily/${id}`,
    BREAKS: '/schedules/breaks',
    BY_STYLIST_BREAKS: (stylistId: string) => `/schedules/stylists/${stylistId}/breaks`,
    BREAK_BY_ID: (id: string) => `/schedules/breaks/${id}`,
  },
  OFF_DAY: {
    BASE: '/off-days',
    MY: '/off-days/my',
    BY_STYLIST: (stylistId: string) => `/off-days/stylists/${stylistId}`,
    STATUS: (id: string) => `/off-days/${id}/status`,
    BY_ID: (id: string) => `/off-days/${id}`,
  },
  SLOT: {
    PUBLIC: {
      CHAIN_AVAILABILITY: '/availability',
    },
    ADMIN: '/slots/admin',
    STYLIST: '/slots/stylist',
    BLOCK: (id: string) => `/slots/${id}/block`,
    UNBLOCK: (id: string) => `/slots/${id}/unblock`,
    CREATE_SPECIAL: '/slots/special',
    LIST_SPECIAL: '/slots/special/list',
    DELETE_SPECIAL: (id: string) => `/slots/special/${id}`,
  },
  BOOKING: {
    BASE: '/bookings',
    MY: '/bookings/my',
    BY_ID: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    RESCHEDULE: (id: string) => `/bookings/${id}/reschedule`,
    STATUS: (id: string) => `/bookings/${id}/status`,
    ADMIN: {
      LIST: '/admin/bookings',
      TODAY: '/admin/bookings/today',
    },
    STYLIST: {
      LIST: '/stylist/bookings',
      TODAY: '/stylist/bookings/today',
      STATS: '/stylist/bookings/stats',
    },
    APPLY_COUPON: (id: string) => `/bookings/${id}/apply-coupon`,
    REMOVE_COUPON: (id: string) => `/bookings/${id}/remove-coupon`,
  },
  WISHLIST: {
    TOGGLE: '/wishlist/toggle',
    ME: '/wishlist/me',
  },
  HOLIDAY: {
    BASE: '/holidays',
    BY_ID: (id: string) => `/holidays/${id}`,
  },
  WALLET: {
    ME: '/wallet/me',
    TRANSACTIONS: '/wallet/transactions',
    CREDIT: '/wallet/credit',
    TOPUP_ORDER: '/wallet/topup/create-order',
    TOPUP_VERIFY: '/wallet/topup/verify',
  },
  STYLIST_WALLET: {
    ME: '/stylist-wallet/my-wallet',
    ADMIN_BY_STYLIST: (stylistId: string) => `/stylist-wallet/admin/stylist/${stylistId}/wallet`,
    WITHDRAW: '/stylist-wallet/withdraw',
    WITHDRAWALS: '/stylist-wallet/withdrawals',
    ADMIN_WITHDRAWALS: '/stylist-wallet/admin/withdrawals',
    PROCESS_WITHDRAWAL: (id: string) => `/stylist-wallet/admin/withdrawals/${id}/process`,
  },
  ESCROW: {
    ADMIN_LIST: '/escrow/admin/list',
    ADMIN_STYLIST_LIST: (stylistId: string) => `/escrow/admin/stylists/${stylistId}`,
    ADMIN_STYLIST_BALANCE: (stylistId: string) => `/escrow/admin/stylists/${stylistId}/balance`,
    BY_BOOKING: (bookingId: string) => `/escrow/admin/booking/${bookingId}`,
    STYLIST_LIST: '/escrow/stylist/list',
    STYLIST_BALANCE: '/escrow/stylist/balance',
  },
  COUPONS: {
    BASE: '/coupons',
    AVAILABLE: '/coupons/available',
    VALIDATE: '/coupons/validate',
    UPDATE: (id: string) => `/coupons/${id}`,
    TOGGLE: (id: string) => `/coupons/${id}/toggle`,
    DELETE: (id: string) => `/coupons/${id}`,
  },
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    VERIFY: '/payments/verify',
    PAY_WITH_WALLET: '/payments/pay-with-wallet',
    PAY_REMAINING_ORDER: '/payments/create-remaining-order',
    PAY_REMAINING_WALLET: '/payments/pay-remaining-with-wallet',
  },
  CHAT: {
    INITIALIZE: '/rooms/initialize',
    USER_ROOMS: '/rooms/user',
    STYLIST_ROOMS: '/rooms/stylist',
    ADMIN_ROOMS: '/rooms/admin',
    ROOM_MESSAGES: (roomId: string) => `/rooms/${roomId}/messages`,
    MARK_READ: (roomId: string) => `/rooms/${roomId}/read`,
    UNREAD_COUNT: (roomId: string) => `/rooms/${roomId}/unread`,
    TOTAL_UNREAD: '/rooms/total-unread/count',
    UPLOAD: '/rooms/upload',
  },
  REVIEW: {
    CREATE: '/reviews',
    GET_ALL: '/reviews',
    TOP_STYLISTS: '/reviews/top-stylists',
    TOP_SERVICES: '/reviews/top-services',
    STYLIST_RATING: (stylistId: string) => `/reviews/stylist/${stylistId}/rating`,
    DELETE: (id: string) => `/reviews/${id}`,
  },
} as const;
