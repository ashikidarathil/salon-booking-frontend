import { api } from '@/services/api/api';
import type {
  Review,
  CreateReviewDto,
  ReviewPagination,
  ReviewPaginationParams,
  TopStylist,
  TopService,
} from './review.types';
import { REVIEW_ENDPOINTS } from './constants/review.routes';

export const reviewService = {
  createReview: async (data: CreateReviewDto): Promise<Review> => {
    const response = await api.post(REVIEW_ENDPOINTS.CREATE, data);
    return response.data.data;
  },

  getReviews: async (params: ReviewPaginationParams): Promise<ReviewPagination> => {
    const response = await api.get(REVIEW_ENDPOINTS.GET_ALL, { params });
    return response.data.data;
  },

  getTopStylists: async (limit: number = 5): Promise<TopStylist[]> => {
    const response = await api.get(REVIEW_ENDPOINTS.TOP_STYLISTS, { params: { limit } });
    return response.data.data;
  },

  getTopServices: async (limit: number = 5): Promise<TopService[]> => {
    const response = await api.get(REVIEW_ENDPOINTS.TOP_SERVICES, { params: { limit } });
    return response.data.data;
  },

  getStylistRating: async (
    stylistId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> => {
    const response = await api.get(REVIEW_ENDPOINTS.STYLIST_RATING(stylistId));
    return response.data.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await api.delete(REVIEW_ENDPOINTS.DELETE(id));
  },

  restoreReview: async (id: string): Promise<void> => {
    await api.post(REVIEW_ENDPOINTS.RESTORE(id));
  },
} as const;
