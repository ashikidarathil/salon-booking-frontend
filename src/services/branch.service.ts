import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type { Branch, NearestBranch } from '@/features/branch/branch.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export const branchService = {
  create(data: { name: string; address: string; phone?: string }) {
    return api.post<ApiResponse<Branch>>(API_ROUTES.BRANCH.BASE, data);
  },

  list(includeDeleted = true) {
    return api.get<ApiResponse<Branch[]>>(
      `${API_ROUTES.BRANCH.BASE}?includeDeleted=${includeDeleted}`,
    );
  },

  update(id: string, data: Partial<{ name: string; address: string; phone?: string }>) {
    const url = API_ROUTES.BRANCH.BY_ID(id);
    return api.patch<ApiResponse<Branch>>(url, data);
  },

  softDelete(id: string) {
    const url = API_ROUTES.BRANCH.SOFT_DELETE(id);
    return api.patch<ApiResponse<Branch>>(url);
  },

  getNearestBranches(latitude: number, longitude: number, maxDistance?: number) {
    return api.post<ApiResponse<NearestBranch[]>>(API_ROUTES.BRANCH.PUBLIC_NEAREST, {
      latitude,
      longitude,
      ...(maxDistance && { maxDistance }),
    });
  },

  async listPublic() {
    return api.get<ApiResponse<Branch[]>>(API_ROUTES.BRANCH.PUBLIC_LIST);
  },

  async getPublic(id: string) {
    return api.get<ApiResponse<Branch>>(API_ROUTES.BRANCH.PUBLIC_BY_ID(id));
  },

  restore(id: string) {
    const url = API_ROUTES.BRANCH.RESTORE(id);
    return api.patch<ApiResponse<Branch>>(url);
  },

  getPaginatedBranches(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isDeleted?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.isDeleted !== undefined)
      queryParams.append('isDeleted', params.isDeleted.toString());

    return api.get<
      ApiResponse<{
        data: Branch[];
        pagination: PaginationMetadata;
      }>
    >(`${API_ROUTES.BRANCH.ADMIN_PAGINATED}?${queryParams.toString()}`);
  },
  
  listPublicPaginated(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    return api.get<
      ApiResponse<{
        data: Branch[];
        pagination: PaginationMetadata;
      }>
    >(`${API_ROUTES.BRANCH.PUBLIC_PAGINATED}?${queryParams.toString()}`);
  },
};
