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
  PaginatedStylistResponse,
  FetchPublicStylistsParams,
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
    return api.get<ApiResponse<PaginatedStylistResponse>>(API_ROUTES.STYLIST_INVITE.PAGINATED, {
      params,
    });
  },

  blockStylist(stylistId: string, isBlocked: boolean) {
    return api.patch<ApiResponse<{ success: boolean }>>(
      API_ROUTES.STYLIST_INVITE.TOGGLE_BLOCK_NEW.replace(':stylistId', stylistId),
      { isBlocked },
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

  applyAsStylist(data: ApplyAsStylistPayload) {
    return api.post<ApiResponse<{ message: string }>>(
      API_ROUTES.STYLIST_INVITE.APPLY_STYLIST,
      data,
    );
  },

  updatePosition(stylistId: string, position: 'JUNIOR' | 'SENIOR' | 'TRAINEE') {
    return api.patch<ApiResponse<StylistListItem>>(
      API_ROUTES.STYLIST_INVITE.UPDATE_POSITION.replace(':stylistId', stylistId),
      { position },
    );
  },

  getPublicStylists(params?: FetchPublicStylistsParams) {
    return api.get<ApiResponse<PaginatedStylistResponse>>(API_ROUTES.STYLIST_INVITE.PUBLIC_LIST, {
      params,
    });
  },

  getPublicStylistById(stylistId: string) {
    const url = API_ROUTES.STYLIST_INVITE.PUBLIC_BY_ID(stylistId);
    return api.get<ApiResponse<StylistListItem>>(url);
  },
};
