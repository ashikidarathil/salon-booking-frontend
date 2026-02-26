import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  OffDay,
  RequestOffDayDto,
  UpdateOffDayStatusDto,
} from '@/features/offDay/offDay.types';

export const offDayService = {
  requestOffDay: (data: RequestOffDayDto) =>
    api.post<ApiResponse<OffDay>>(API_ROUTES.OFF_DAY.BASE, data),

  getMyOffDays: () => api.get<ApiResponse<OffDay[]>>(API_ROUTES.OFF_DAY.MY),

  getStylistOffDays: (stylistId: string) =>
    api.get<ApiResponse<OffDay[]>>(API_ROUTES.OFF_DAY.BY_STYLIST(stylistId)),

  getAllOffDays: () => api.get<ApiResponse<OffDay[]>>(API_ROUTES.OFF_DAY.BASE),

  updateStatus: (offDayId: string, data: UpdateOffDayStatusDto) =>
    api.patch<ApiResponse<OffDay>>(API_ROUTES.OFF_DAY.STATUS(offDayId), data),

  deleteOffDay: (offDayId: string) =>
    api.delete<ApiResponse<{ success: true }>>(API_ROUTES.OFF_DAY.BY_ID(offDayId)),
};
