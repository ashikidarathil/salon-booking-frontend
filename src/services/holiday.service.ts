import { api } from './api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { Holiday, CreateHolidayDto } from '@/features/holiday/holiday.types';
import type { ApiResponse } from '@/common/types/api.types';

export const holidayService = {
  listHolidays: async (branchId?: string) => {
    return api.get<ApiResponse<Holiday[]>>(API_ROUTES.HOLIDAY.BASE, {
      params: { branchId },
    });
  },

  createHoliday: async (data: CreateHolidayDto) => {
    return api.post<ApiResponse<Holiday>>(API_ROUTES.HOLIDAY.BASE, data);
  },

  deleteHoliday: async (id: string) => {
    return api.delete<ApiResponse<void>>(API_ROUTES.HOLIDAY.BY_ID(id));
  },
};
