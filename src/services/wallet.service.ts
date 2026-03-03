import { api } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';

export interface WalletResponse {
  userId: string;
  balance: number;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  status: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

const WalletService = {
  getMyWallet: async () => {
    const response = await api.get(API_ROUTES.WALLET.ME);
    return response.data;
  },

  getTransactionHistory: async () => {
    const response = await api.get(API_ROUTES.WALLET.TRANSACTIONS);
    return response.data;
  },

  creditWallet: async (amount: number, description: string) => {
    const response = await api.post(API_ROUTES.WALLET.CREDIT, { amount, description });
    return response.data;
  },
};

export default WalletService;
