import { api as axiosInstance } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';
import type { StylistWallet } from '../features/stylistWallet/stylistWallet.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const StylistWalletService = {
  // ─── Stylist ──────────────────────────────
  getWallet: async () => {
    const { data } = await axiosInstance.get<ApiResponse<StylistWallet>>(
      API_ROUTES.STYLIST_WALLET.ME,
    );
    return data;
  },

  // ─── Admin ────────────────────────────────
  getWalletByStylistId: async (stylistId: string) => {
    const { data } = await axiosInstance.get<ApiResponse<StylistWallet>>(
      API_ROUTES.STYLIST_WALLET.ADMIN_BY_STYLIST(stylistId),
    );
    return data;
  },
};

export default StylistWalletService;
