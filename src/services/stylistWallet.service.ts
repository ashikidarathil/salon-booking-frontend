import { api as axiosInstance } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { StylistWallet } from '@/features/stylistWallet/stylistWallet.types';
import type { ApiResponse } from '@/common/types/api.types';

const StylistWalletService = {
  // ─── Stylist ──────────────────────────────
  getWallet: async () => {
    const { data } = await axiosInstance.get<ApiResponse<StylistWallet>>(
      API_ROUTES.STYLIST_WALLET.ME,
    );
    return data.data;
  },

  // ─── Admin ────────────────────────────────
  getWalletByStylistId: async (stylistId: string) => {
    const { data } = await axiosInstance.get<ApiResponse<StylistWallet>>(
      API_ROUTES.STYLIST_WALLET.ADMIN_BY_STYLIST(stylistId),
    );
    return data.data;
  },
};

export default StylistWalletService;
