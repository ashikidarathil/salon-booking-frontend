export interface StylistWallet {
  _id: string;
  stylistId: string;
  withdrawableBalance: number;
  pendingWithdrawal: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StylistWalletState {
  wallet: StylistWallet | null;
  selectedStylistWallet: StylistWallet | null;
  loading: boolean;
  error: string | null;
}
