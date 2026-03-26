import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  BranchStylist,
  UnassignedStylist,
} from '@/features/stylistBranch/stylistBranch.types';
import type { StylistService } from '@/features/booking/booking.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';

const StylistBranchService = {
  listBranchStylists(branchId: string) {
    return api.get<ApiResponse<BranchStylist[]>>(
      API_ROUTES.STYLIST_BRANCH.PUBLIC.LIST_BRANCH_STYLISTS(branchId),
    );
  },

  getStylistBranches(stylistId: string) {
    return api.get<ApiResponse<BranchStylist[]>>(`/stylists/${stylistId}/branches`);
  },

  listUnassignedOptions(branchId: string) {
    return api.get<ApiResponse<UnassignedStylist[]>>(
      API_ROUTES.STYLIST_BRANCH.ADMIN.OPTIONS_UNASSIGNED(branchId),
    );
  },

  assign(branchId: string, stylistId: string) {
    return api.post<ApiResponse<BranchStylist>>(API_ROUTES.STYLIST_BRANCH.ADMIN.ASSIGN(branchId), {
      stylistId,
    });
  },

  unassign(branchId: string, stylistId: string) {
    return api.patch<ApiResponse<{ success: true }>>(
      API_ROUTES.STYLIST_BRANCH.ADMIN.UNASSIGN(branchId),
      { stylistId },
    );
  },

  changeBranch(branchId: string, stylistId: string) {
    return api.patch<ApiResponse<BranchStylist>>(
      API_ROUTES.STYLIST_BRANCH.ADMIN.CHANGE_BRANCH(branchId),
      { stylistId },
    );
  },

  listBranchStylistsPaginated(
    branchId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return api.get<
      ApiResponse<{
        data: BranchStylist[];
        pagination: PaginationMetadata;
      }>
    >(
      `${API_ROUTES.STYLIST_BRANCH.ADMIN.LIST_BRANCH_STYLISTS_PAGINATED(branchId)}?${queryParams.toString()}`,
    );
  },

  listUnassignedOptionsPaginated(
    branchId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return api.get<
      ApiResponse<{
        data: UnassignedStylist[];
        pagination: PaginationMetadata;
      }>
    >(
      `${API_ROUTES.STYLIST_BRANCH.ADMIN.OPTIONS_UNASSIGNED_PAGINATED(branchId)}?${queryParams.toString()}`,
    );
  },
  getStylistsByService(serviceId: string) {
    return api.get<ApiResponse<BranchStylist[]>>(
      API_ROUTES.STYLIST_SERVICE.PUBLIC.STYLISTS_BY_SERVICE(serviceId),
    );
  },

  getStylistServices(stylistId: string, branchId?: string) {
    const params = branchId ? `?branchId=${branchId}` : '';
    return api.get<ApiResponse<StylistService[]>>(
      API_ROUTES.STYLIST_SERVICE.PUBLIC.LIST_BY_STYLIST(stylistId) + params,
    );
  },
};

export default StylistBranchService;
