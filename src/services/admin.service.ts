import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { AdminDashboardStats, AdminStatsQuery } from '@/features/admin/types/admin.types';

class AdminService {
  async getDashboardStats(params?: AdminStatsQuery): Promise<{ data: AdminDashboardStats }> {
    const response = await api.get<{ data: AdminDashboardStats }>(API_ROUTES.USER.DASHBOARD.STATS, {
      params,
    });
    return response.data;
  }
}

export const adminService = new AdminService();
