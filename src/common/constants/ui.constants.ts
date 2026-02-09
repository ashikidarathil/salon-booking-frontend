export const UI_CONSTANTS = {
  COLORS: {
    ADMIN: '#10B981', // Emerald green
    SUCCESS: '#10B981',
    ERROR: '#EF4444',
    WARNING: '#F59E0B',
    INFO: '#3B82F6',
  },

  PAGINATION: {
    ITEMS_PER_PAGE: 5,
    DEFAULT_PAGE: 1,
  },

  STYLIST: {
    STATUS: {
      ACTIVE: 'ACTIVE',
      APPLIED: 'APPLIED',
      PENDING: 'PENDING',
      EXPIRED: 'EXPIRED',
      ACCEPTED: 'ACCEPTED',
      CANCELLED: 'CANCELLED',
      REJECTED: 'REJECTED',
    },

    USER_STATUS: {
      APPLIED: 'APPLIED',
      PENDING: 'PENDING',
      ACTIVE: 'ACTIVE',
      REJECTED: 'REJECTED',
      EXPIRED: 'EXPIRED',
      ACCEPTED: 'ACCEPTED',
    },
  },

  INVITE: {
    EXPIRY_HOURS: 24,
  },
} as const;
