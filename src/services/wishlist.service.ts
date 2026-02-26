import { api } from './api/api';
import { API_ROUTES } from '@/common/constants/api.routes';

export interface ToggleWishlistResponse {
  isAdded: boolean;
}

const wishlistService = {
  toggleFavorite: async (stylistId: string) => {
    const response = await api.post<{
      success: boolean;
      data: { isAdded: boolean };
      message: string;
    }>(API_ROUTES.WISHLIST.TOGGLE, { stylistId });
    return response.data.data;
  },

  getMyFavorites: async (branchId?: string) => {
    const response = await api.get<{ success: boolean; data: string[]; message: string }>(
      API_ROUTES.WISHLIST.ME,
      { params: { branchId } },
    );
    return response.data.data;
  },
};

export default wishlistService;
