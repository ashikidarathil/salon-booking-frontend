import { api } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';
import type {
  WalletResponse,
  WalletTransaction,
  WalletTopupOrder,
  VerifyTopupPayload,
} from '../features/wallet/wallet.types';
import type { ApiResponse } from '@/common/types/api.types';

const WalletService = {
  getMyWallet: async () => {
    const response = await api.get<ApiResponse<WalletResponse>>(API_ROUTES.WALLET.ME);
    return response.data.data;
  },

  getTransactionHistory: async () => {
    const response = await api.get<ApiResponse<WalletTransaction[]>>(
      API_ROUTES.WALLET.TRANSACTIONS,
    );
    return response.data.data;
  },

  creditWallet: async (amount: number, description: string) => {
    const response = await api.post<ApiResponse<WalletResponse>>(API_ROUTES.WALLET.CREDIT, {
      amount,
      description,
    });
    return response.data.data;
  },

  createTopupOrder: async (amount: number) => {
    const response = await api.post<ApiResponse<WalletTopupOrder>>(API_ROUTES.WALLET.TOPUP_ORDER, {
      amount,
    });
    return response.data.data;
  },

  verifyTopup: async (data: VerifyTopupPayload) => {
    const response = await api.post<ApiResponse<WalletResponse>>(
      API_ROUTES.WALLET.TOPUP_VERIFY,
      data,
    );
    return response.data.data;
  },
};

export default WalletService;
