import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type { BranchCategoryItem } from '@/features/branchCategory/branchCategory.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export const branchCategoryService = {
  list(branchId: string) {
    return api.get<ApiResponse<BranchCategoryItem[]>>(
      API_ROUTES.BRANCH_CATEGORY.ADMIN.LIST(branchId),
    );
  },

  toggle(branchId: string, categoryId: string, isActive: boolean) {
    return api.patch<ApiResponse<BranchCategoryItem>>(
      API_ROUTES.BRANCH_CATEGORY.ADMIN.TOGGLE(branchId, categoryId),
      { isActive },
    );
  },
  listPaginated(
    branchId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      isActive?: boolean;
    },
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    return api.get<
      ApiResponse<{
        data: BranchCategoryItem[];
        pagination: PaginationMetadata;
      }>
    >(`${API_ROUTES.BRANCH_CATEGORY.ADMIN.LIST_PAGINATED(branchId)}?${queryParams.toString()}`);
  },
};
