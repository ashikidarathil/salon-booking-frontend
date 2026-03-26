export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: '/notifications',
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
} as const;
