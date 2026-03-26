import { api } from './api/api';
import { buildUrl } from '@/common/utils/api.utils';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type { UserListItem } from '@/features/user/user.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isBlocked?: boolean;
  isActive?: boolean;
  role?: string;
}

export interface PaginatedUsersResponse {
  data: UserListItem[];
  pagination: PaginationMetadata;
}

export const userService = {
  toggleBlock(userId: string, isBlocked: boolean) {
    const url = buildUrl(API_ROUTES.USER.TOGGLE_BLOCK, { userId });
    return api.patch(url, { isBlocked });
  },

  getUsers(query: UserQuery) {
    return api.get<ApiResponse<PaginatedUsersResponse>>(API_ROUTES.USER.GET_USERS, {
      params: query,
    });
  },
};
