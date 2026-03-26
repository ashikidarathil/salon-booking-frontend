export const REVIEW_ENDPOINTS = {
  CREATE: '/reviews',
  GET_ALL: '/reviews',
  TOP_STYLISTS: '/reviews/top-stylists',
  TOP_SERVICES: '/reviews/top-services',
  STYLIST_RATING: (stylistId: string) => `/reviews/stylist/${stylistId}/rating`,
  DELETE: (id: string) => `/reviews/${id}`,
  RESTORE: (id: string) => `/reviews/${id}/restore`,
} as const;
