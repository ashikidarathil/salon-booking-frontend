export const BOOKING_ROUTES = {
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
} as const;
