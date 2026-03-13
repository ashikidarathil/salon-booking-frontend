export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface WalletResponse {
  userId: string;
  balance: number;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
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

export interface WalletTopupOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyTopupPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}
