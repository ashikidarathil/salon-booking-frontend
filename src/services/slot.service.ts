import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { SlotItem, ListSlotsParams } from '@/features/slot/slot.types';
import type { ApiResponse } from '@/common/types/api.types';

export const slotService = {
  listAvailableSlots: async (params: ListSlotsParams) => {
    return api.get<ApiResponse<SlotItem[]>>(API_ROUTES.SLOT.PUBLIC.CHAIN_AVAILABILITY, { params });
  },

  adminListSlots: async (params: ListSlotsParams) => {
    return api.get<ApiResponse<SlotItem[]>>(API_ROUTES.SLOT.ADMIN, {
      params: { ...params, includeAll: true },
    });
  },

  getStylistSlots: async (params: { branchId: string; date: string; stylistId?: string }) => {
    return api.get<ApiResponse<SlotItem[]>>(API_ROUTES.SLOT.STYLIST, {
      params: { ...params, includeAll: true },
    });
  },

  blockSlot: async (slotId: string, reason?: string) => {
    return api.patch<ApiResponse<SlotItem>>(API_ROUTES.SLOT.BLOCK(slotId), { reason });
  },

  unblockSlot: async (slotId: string) => {
    return api.patch<ApiResponse<SlotItem>>(API_ROUTES.SLOT.UNBLOCK(slotId));
  },

  createSpecialSlot: async (dto: {
    stylistId: string;
    branchId: string;
    date: string;
    startTime: string;
    endTime: string;
    note?: string;
    serviceId?: string;
  }) => {
    return api.post<ApiResponse<SlotItem>>(API_ROUTES.SLOT.CREATE_SPECIAL, dto);
  },

  listSpecialSlots: async (params: {
    branchId?: string;
    stylistId?: string;
    date?: string;
    status?: string;
  }) => {
    return api.get<ApiResponse<SlotItem[]>>(API_ROUTES.SLOT.LIST_SPECIAL, { params });
  },

  cancelSpecialSlot: async (id: string) => {
    return api.delete<ApiResponse<SlotItem>>(API_ROUTES.SLOT.DELETE_SPECIAL(id));
  },
};
