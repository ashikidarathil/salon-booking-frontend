import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { PaginationQueryDto, PaginatedEscrowResponse } from './escrow.types';
import type { ApiResponse } from '@/common/types/api.types';

export const escrowService = {
  getAllEscrows: async (query: PaginationQueryDto): Promise<PaginatedEscrowResponse> => {
    const response = await api.get<ApiResponse<PaginatedEscrowResponse>>(
      API_ROUTES.ESCROW.ADMIN_LIST,
      { params: query },
    );
    return response.data.data;
  },

  getStylistEscrows: async (query: PaginationQueryDto): Promise<PaginatedEscrowResponse> => {
    const response = await api.get<ApiResponse<PaginatedEscrowResponse>>(
      API_ROUTES.ESCROW.STYLIST_LIST,
      { params: query },
    );
    return response.data.data;
  },

  getHeldBalance: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(API_ROUTES.ESCROW.STYLIST_BALANCE);
    return response.data.data;
  },

  getAdminStylistEscrows: async (
    stylistId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedEscrowResponse> => {
    const response = await api.get<ApiResponse<PaginatedEscrowResponse>>(
      API_ROUTES.ESCROW.ADMIN_STYLIST_LIST(stylistId),
      { params: query },
    );
    return response.data.data;
  },

  getAdminStylistHeldBalance: async (stylistId: string): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(
      API_ROUTES.ESCROW.ADMIN_STYLIST_BALANCE(stylistId),
    );
    return response.data.data;
  },
};

export default escrowService;
