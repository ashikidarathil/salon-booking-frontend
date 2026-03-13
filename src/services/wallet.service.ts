import { api } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';
import type { 
  WalletResponse, 
  WalletTransaction, 
  WalletTopupOrder, 
  VerifyTopupPayload 
} from '../features/wallet/wallet.types';

const WalletService = {
  getMyWallet: async (): Promise<WalletResponse> => {
    const response = await api.get<{ data: WalletResponse }>(API_ROUTES.WALLET.ME);
    return response.data.data;
  },

  getTransactionHistory: async (): Promise<WalletTransaction[]> => {
    const response = await api.get<{ data: WalletTransaction[] }>(API_ROUTES.WALLET.TRANSACTIONS);
    return response.data.data;
  },

  creditWallet: async (amount: number, description: string): Promise<WalletResponse> => {
    const response = await api.post<{ data: WalletResponse }>(API_ROUTES.WALLET.CREDIT, { amount, description });
    return response.data.data;
  },

  createTopupOrder: async (amount: number): Promise<WalletTopupOrder> => {
    const response = await api.post<{ data: WalletTopupOrder }>(API_ROUTES.WALLET.TOPUP_ORDER, { amount });
    return response.data.data;
  },

  verifyTopup: async (data: VerifyTopupPayload): Promise<WalletResponse> => {
    const response = await api.post<{ data: WalletResponse }>(API_ROUTES.WALLET.TOPUP_VERIFY, data);
    return response.data.data;
  },
};

export default WalletService;
