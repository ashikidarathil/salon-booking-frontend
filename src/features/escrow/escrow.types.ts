export enum EscrowStatus {
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface EscrowResponse {
  _id: string;
  bookingId: string | { _id: string; [key: string]: unknown };
  userId: string | { _id: string; [key: string]: unknown };
  amount: number;
  status: EscrowStatus;
  heldAt: string;
  releasedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowState {
  escrows: EscrowResponse[];
  currentEscrow: EscrowResponse | null;
  loading: boolean;
  error: string | null;
}
