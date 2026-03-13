import { api as axiosInstance } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';
import type { PaymentVerificationDto } from '../features/payment/payment.types';

class PaymentService {
  async createOrder(bookingId: string) {
    return axiosInstance.post(API_ROUTES.PAYMENTS.CREATE_ORDER, { bookingId });
  }

  async verifyPayment(data: PaymentVerificationDto) {
    return axiosInstance.post(API_ROUTES.PAYMENTS.VERIFY, data);
  }

  async payWithWallet(bookingId: string) {
    return axiosInstance.post(API_ROUTES.PAYMENTS.PAY_WITH_WALLET, { bookingId });
  }

  async createRemainingOrder(bookingId: string) {
    return axiosInstance.post(API_ROUTES.PAYMENTS.PAY_REMAINING_ORDER, { bookingId });
  }

  async payRemainingWithWallet(bookingId: string) {
    return axiosInstance.post(API_ROUTES.PAYMENTS.PAY_REMAINING_WALLET, { bookingId });
  }
}

export default new PaymentService();
