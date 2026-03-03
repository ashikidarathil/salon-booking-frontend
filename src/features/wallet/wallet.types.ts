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

export interface WalletState {
  wallet: WalletResponse | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
}
