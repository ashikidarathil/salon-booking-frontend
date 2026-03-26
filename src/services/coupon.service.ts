import { api as axiosInstance } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';
import type {
  CreateCouponRequest,
  CouponQuery,
  PaginatedCouponResponse,
  Coupon,
} from '../features/coupon/coupon.types';
import type { ApiResponse } from '@/common/types/api.types';

class CouponService {
  async listAllCoupons(params?: CouponQuery) {
    return axiosInstance.get<ApiResponse<PaginatedCouponResponse>>(API_ROUTES.COUPONS.BASE, {
      params,
    });
  }

  async createCoupon(data: CreateCouponRequest) {
    return axiosInstance.post<ApiResponse<Coupon>>(API_ROUTES.COUPONS.BASE, data);
  }

  async updateCoupon(id: string, data: Partial<CreateCouponRequest>) {
    return axiosInstance.put<ApiResponse<Coupon>>(API_ROUTES.COUPONS.UPDATE(id), data);
  }

  async listAvailableCoupons() {
    return axiosInstance.get<ApiResponse<Coupon[]>>(API_ROUTES.COUPONS.AVAILABLE);
  }

  async validateCoupon(code: string, amount: number) {
    return axiosInstance.post<ApiResponse<Coupon>>(API_ROUTES.COUPONS.VALIDATE, { code, amount });
  }

  async toggleStatus(id: string) {
    return axiosInstance.patch<ApiResponse<Coupon>>(API_ROUTES.COUPONS.TOGGLE(id));
  }

  async deleteCoupon(id: string) {
    return axiosInstance.patch<ApiResponse<Coupon>>(API_ROUTES.COUPONS.DELETE(id));
  }
}

export default new CouponService();
