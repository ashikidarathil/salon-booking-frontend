export interface Review {
  id: string;
  userId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  bookingId: string;
  stylistId: string;
  serviceId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  isDeleted?: boolean;
}

export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface ReviewPagination {
  reviews: Review[];
  total: number;
}

export interface ReviewPaginationParams {
  page?: number;
  limit?: number;
  stylistId?: string;
  serviceId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface TopStylist {
  stylistId: string;
  stylistName: string;
  avatar?: string;
  averageRating: number;
  totalReviews: number;
  bookingCount: number;
}

export interface TopService {
  serviceId: string;
  serviceName: string;
  averageRating: number;
  totalReviews: number;
  bookingCount: number;
  imageUrl?: string;
  description?: string;
  categoryName?: string;
}

export interface ReviewState {
  reviews: Review[];
  total: number;
  topStylists: TopStylist[];
  topServices: TopService[];
  stats: {
    averageRating: number;
    totalReviews: number;
  };
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}
