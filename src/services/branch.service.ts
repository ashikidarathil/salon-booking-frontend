import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  Branch,
  NearestBranch,
  BranchQuery,
  PaginatedBranchResponse,
} from '@/features/branch/branch.types';

export const branchService = {
  create(data: {
    name: string;
    address: string;
    phone?: string;
    latitude: number;
    longitude: number;
  }) {
    return api.post<ApiResponse<Branch>>(API_ROUTES.BRANCH.BASE, data);
  },

  list(includeDeleted = true) {
    return api.get<ApiResponse<Branch[]>>(
      `${API_ROUTES.BRANCH.BASE}?includeDeleted=${includeDeleted}`,
    );
  },

  update(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      phone?: string;
      latitude: number;
      longitude: number;
      defaultBreaks?: Array<{ startTime: string; endTime: string; description: string }>;
    }>,
  ) {
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

  getPaginatedBranches(params?: BranchQuery) {
    return api.get<ApiResponse<PaginatedBranchResponse>>(API_ROUTES.BRANCH.ADMIN_PAGINATED, {
      params,
    });
  },

  listPublicPaginated(params?: { page?: number; limit?: number; search?: string }) {
    return api.get<ApiResponse<PaginatedBranchResponse>>(API_ROUTES.BRANCH.PUBLIC_PAGINATED, {
      params,
    });
  },
};
