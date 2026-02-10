import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type { BranchServiceItem } from '@/features/branchService/branchService.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export const branchServiceService = {
  list(branchId: string) {
    return api.get<ApiResponse<BranchServiceItem[]>>(
      API_ROUTES.BRANCH_SERVICE.ADMIN.LIST(branchId),
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
      configured?: boolean;
      isActive?: boolean;
    },
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.configured !== undefined)
      queryParams.append('configured', params.configured.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    return api.get<
      ApiResponse<{
        data: BranchServiceItem[];
        pagination: PaginationMetadata;
      }>
    >(`${API_ROUTES.BRANCH_SERVICE.ADMIN.LIST_PAGINATED(branchId)}?${queryParams.toString()}`);
  },

  upsert(
    branchId: string,
    serviceId: string,
    data: { price: number; duration: number; isActive?: boolean },
  ) {
    return api.patch<ApiResponse<BranchServiceItem>>(
      API_ROUTES.BRANCH_SERVICE.ADMIN.UPSERT(branchId, serviceId),
      data,
    );
  },

  toggleStatus(branchId: string, serviceId: string, isActive: boolean) {
    return api.patch<ApiResponse<BranchServiceItem>>(
      API_ROUTES.BRANCH_SERVICE.ADMIN.TOGGLE_STATUS(branchId, serviceId),
      { isActive },
    );
  },

  async listPublicPaginated(
    branchId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
    },
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);

    return api.get<
      ApiResponse<{
        data: BranchServiceItem[];
        pagination: PaginationMetadata;
      }>
    >(`${API_ROUTES.BRANCH_SERVICE.PUBLIC.LIST_PAGINATED(branchId)}?${queryParams.toString()}`);
  },

  async getPublic(branchId: string, serviceId: string) {
    return api.get<ApiResponse<BranchServiceItem>>(
      API_ROUTES.BRANCH_SERVICE.PUBLIC.BY_ID(branchId, serviceId),
    );
  },
};
