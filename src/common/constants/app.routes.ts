export const APP_ROUTES = {
  // Public routes
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY_OTP: '/verify-otp',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_PHONE_OTP: '/verify-phone-otp',
    VERIFY_RESET_OTP: '/verify-reset-otp',
    NEW_PASSWORD: '/new-password',
    CONTACT: '/contact',
  },

  // Admin routes
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin',
    STYLISTS: '/admin/stylists',
    OFF_DAYS: '/admin/off-days',
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    SETTINGS: '/admin/settings',
    CATEGORIES: '/admin/categories',
    SERVICES: '/admin/services',
    BRANCHES: '/admin/branches',
    STYLIST_DETAILS: '/admin/stylists/:stylistId',
    SLOTS: '/admin/slots',
  },

  // Stylist routes
  STYLIST: {
    LOGIN: '/stylist/login',
    DASHBOARD: '/stylist',
    SCHEDULE: '/stylist/schedule',
    OFF_DAYS: '/stylist/off-days',
    PROFILE: '/stylist/profile',
    INVITE: '/stylist/invite/:token',
    SLOTS: '/stylist/slots',
  },

  // User routes
  USER: {
    DASHBOARD: '/',
    PROFILE: '/profile',
    STYLISTS: '/stylists',
    STYLIST_DETAILS: '/stylists/:stylistId',
  },
} as const;
