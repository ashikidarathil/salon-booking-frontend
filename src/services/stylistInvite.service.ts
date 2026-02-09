import { api } from './api/api';
import { buildUrl } from '@/common/utils/api.utils';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  CreateInvitePayload,
  StylistListItem,
  ValidateInviteResponse,
  AcceptInvitePayload,
  ApplyAsStylistPayload,
} from '@/features/stylistInvite/stylistInvite.types';

export const stylistInviteService = {
  createInvite(data: CreateInvitePayload) {
    return api.post<ApiResponse<{ inviteLink: string; userId: string }>>(
      API_ROUTES.STYLIST_INVITE.CREATE_INVITE,
      data,
    );
  },

  listStylists() {
    return api.get<ApiResponse<StylistListItem[]>>(API_ROUTES.STYLIST_INVITE.LIST_STYLISTS);
  },

  getPaginatedStylists(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isBlocked?: boolean;
    isActive?: boolean;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.isBlocked !== undefined)
      queryParams.append('isBlocked', params.isBlocked.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.status) queryParams.append('status', params.status);

    return api.get<
      ApiResponse<{
        data: StylistListItem[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }>
    >(`${API_ROUTES.STYLIST_INVITE.PAGINATED}?${queryParams.toString()}`);
  },

  blockStylist(stylistId: string, isBlocked: boolean) {
    return api.patch<ApiResponse<{ success: boolean }>>(
      API_ROUTES.STYLIST_INVITE.TOGGLE_BLOCK_NEW.replace(':stylistId', stylistId),
      {
        isBlocked,
      },
    );
  },

  validate(token: string) {
    const url = buildUrl(API_ROUTES.STYLIST_INVITE.VALIDATE_INVITE, { token });
    return api.get<ApiResponse<ValidateInviteResponse>>(url);
  },

  accept(token: string, data: AcceptInvitePayload) {
    const url = buildUrl(API_ROUTES.STYLIST_INVITE.ACCEPT_INVITE, { token });
    return api.post<ApiResponse<{ success: boolean }>>(url, data);
  },

  approve(userId: string) {
    const url = buildUrl(API_ROUTES.STYLIST_INVITE.APPROVE_STYLIST, { userId });
    return api.post<ApiResponse<{ success: boolean }>>(url);
  },

  reject(userId: string) {
    const url = buildUrl(API_ROUTES.STYLIST_INVITE.REJECT_STYLIST, { userId });
    return api.post<ApiResponse<{ success: boolean }>>(url);
  },

  sendInviteToApplied(userId: string) {
    const url = buildUrl(API_ROUTES.STYLIST_INVITE.SEND_INVITE_TO_APPLIED, { userId });
    return api.post<ApiResponse<{ inviteLink: string }>>(url);
  },
  toggleBlock(userId: string, block: boolean) {
    const url = buildUrl(API_ROUTES.STYLIST_INVITE.TOGGLE_BLOCK, { userId });
    return api.post<ApiResponse<{ success: boolean; block: boolean }>>(url, { block });
  },
  applyAsStylist(data: ApplyAsStylistPayload) {
    return api.post<ApiResponse<{ message: string }>>(
      API_ROUTES.STYLIST_INVITE.APPLY_STYLIST,
      data,
    );
  },
};
