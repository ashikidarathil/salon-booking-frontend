import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  WeeklySchedule,
  DailyOverride,
  UpdateWeeklyScheduleDto,
  CreateDailyOverrideDto,
  StylistBreak,
  CreateStylistBreakDto,
} from '@/features/schedule/schedule.types';

export const scheduleService = {
  getWeeklySchedule(stylistId: string, branchId: string) {
    return api.get<ApiResponse<WeeklySchedule[]>>(
      `${API_ROUTES.SCHEDULE.BY_STYLIST_WEEKLY(stylistId)}?branchId=${branchId}`,
    );
  },

  updateWeeklySchedule(dayOfWeek: number, data: UpdateWeeklyScheduleDto) {
    return api.patch<ApiResponse<WeeklySchedule>>(API_ROUTES.SCHEDULE.WEEKLY(dayOfWeek), data);
  },

  getDailyOverrides(stylistId: string, branchId: string) {
    return api.get<ApiResponse<DailyOverride[]>>(
      `${API_ROUTES.SCHEDULE.BY_STYLIST_DAILY(stylistId)}?branchId=${branchId}`,
    );
  },

  createDailyOverride(data: CreateDailyOverrideDto) {
    return api.post<ApiResponse<DailyOverride>>(API_ROUTES.SCHEDULE.DAILY, data);
  },

  deleteDailyOverride(overrideId: string) {
    return api.delete<ApiResponse<{ success: true }>>(API_ROUTES.SCHEDULE.DAILY_BY_ID(overrideId));
  },

  getBreaks(stylistId: string, branchId: string) {
    return api.get<ApiResponse<StylistBreak[]>>(
      `${API_ROUTES.SCHEDULE.BY_STYLIST_BREAKS(stylistId)}?branchId=${branchId}`,
    );
  },

  createBreak(data: CreateStylistBreakDto) {
    return api.post<ApiResponse<StylistBreak>>(API_ROUTES.SCHEDULE.BREAKS, data);
  },

  deleteBreak(breakId: string) {
    return api.delete<ApiResponse<{ success: true }>>(API_ROUTES.SCHEDULE.BREAK_BY_ID(breakId));
  },
};
