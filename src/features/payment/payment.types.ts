export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  bookingId: string;
  userId: string;
  createdAt: string;
}

export interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerificationDto {
  orderId: string;
  paymentId: string;
  signature: string;
  bookingId: string;
}

export interface CreateOrderPayload {
  bookingId: string;
}

export interface WalletPayPayload {
  bookingId: string;
}

export interface PaymentState {
  currentOrder: OrderResponse | null;
  loading: boolean;
  error: string | null;
}
