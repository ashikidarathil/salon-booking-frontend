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
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    SETTINGS: '/admin/settings',
    CATEGORIES: '/admin/categories',
    SERVICES: '/admin/services',
    BRANCHES: '/admin/branches',
  },

  // Stylist routes
  STYLIST: {
    LOGIN: '/stylist/login',
    DASHBOARD: '/stylist',
    PROFILE: '/stylist/profile',
    INVITE: '/stylist/invite/:token',
  },

  // User routes
  USER: {
    DASHBOARD: '/user',
    PROFILE: '/user/profile',
  },
} as const;
