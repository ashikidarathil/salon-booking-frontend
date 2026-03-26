import { api as axiosInstance } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';
import type {
  PaymentVerificationDto,
  OrderResponse,
  Payment,
} from '../features/payment/payment.types';
import type { ApiResponse } from '@/common/types/api.types';

const PaymentService = {
  createOrder: async (bookingId: string) => {
    const response = await axiosInstance.post<ApiResponse<OrderResponse>>(
      API_ROUTES.PAYMENTS.CREATE_ORDER,
      { bookingId },
    );
    return response.data.data;
  },

  verifyPayment: async (data: PaymentVerificationDto) => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(
      API_ROUTES.PAYMENTS.VERIFY,
      data,
    );
    return response.data.data;
  },

  payWithWallet: async (bookingId: string) => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(
      API_ROUTES.PAYMENTS.PAY_WITH_WALLET,
      { bookingId },
    );
    return response.data.data;
  },

  createRemainingOrder: async (bookingId: string) => {
    const response = await axiosInstance.post<ApiResponse<OrderResponse>>(
      API_ROUTES.PAYMENTS.PAY_REMAINING_ORDER,
      { bookingId },
    );
    return response.data.data;
  },

  payRemainingWithWallet: async (bookingId: string) => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(
      API_ROUTES.PAYMENTS.PAY_REMAINING_WALLET,
      { bookingId },
    );
    return response.data.data;
  },
};

export default PaymentService;
