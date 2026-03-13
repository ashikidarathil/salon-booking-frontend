import { api as axiosInstance } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';
import type { CreateCouponRequest } from '../features/coupon/coupon.types';

class CouponService {
  async listAllCoupons(params?: any) {
    return axiosInstance.get(API_ROUTES.COUPONS.BASE, { params });
  }

  async createCoupon(data: CreateCouponRequest) {
    return axiosInstance.post(API_ROUTES.COUPONS.BASE, data);
  }

  async updateCoupon(id: string, data: Partial<CreateCouponRequest>) {
    return axiosInstance.put(API_ROUTES.COUPONS.UPDATE(id), data);
  }

  async listAvailableCoupons() {
    return axiosInstance.get(API_ROUTES.COUPONS.AVAILABLE);
  }

  async validateCoupon(code: string, amount: number) {
    return axiosInstance.post(API_ROUTES.COUPONS.VALIDATE, { code, amount });
  }

  async toggleStatus(id: string) {
    return axiosInstance.patch(API_ROUTES.COUPONS.TOGGLE(id));
  }

  async deleteCoupon(id: string) {
    return axiosInstance.patch(API_ROUTES.COUPONS.DELETE(id));
  }
}

export default new CouponService();
