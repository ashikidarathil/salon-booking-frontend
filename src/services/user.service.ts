import { api } from './api/api';
import { buildUrl } from '@/common/utils/api.utils';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type { UserListItem } from '@/features/user/user.types';

export interface PaginatedUsersResponse {
  data: UserListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const userService = {
  toggleBlock(userId: string, isBlocked: boolean) {
    const url = buildUrl(API_ROUTES.USER.TOGGLE_BLOCK, { userId });
    return api.patch(url, { isBlocked });
  },

  getUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isBlocked?: boolean;
    isActive?: boolean;
    role?: string;
  }) {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    if (query.search) params.append('search', query.search);

    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    if (query.isBlocked !== undefined) params.append('isBlocked', query.isBlocked.toString());
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.role) params.append('role', query.role);

    return api.get<ApiResponse<PaginatedUsersResponse>>(
      `${API_ROUTES.USER.GET_USERS}?${params.toString()}`,
    );
  },
};
