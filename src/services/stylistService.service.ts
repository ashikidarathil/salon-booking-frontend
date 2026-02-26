import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  StylistServiceItem,
  FetchStylistServicesParams,
  StylistServicePagination,
} from '@/features/stylistService/stylistService.types';

export const stylistServiceService = {
  getStylistServices: (params: FetchStylistServicesParams) => {
    const { stylistId, ...query } = params;
    return api.get<
      ApiResponse<{
        data: StylistServiceItem[];
        pagination: StylistServicePagination;
      }>
    >(API_ROUTES.STYLIST_SERVICE.ADMIN.LIST_PAGINATED(stylistId), { params: query });
  },

  toggleStatus: (stylistId: string, serviceId: string, isActive: boolean) =>
    api.patch<ApiResponse<{ success: boolean }>>(
      API_ROUTES.STYLIST_SERVICE.ADMIN.TOGGLE_STATUS(stylistId, serviceId),
      { isActive },
    ),
};
