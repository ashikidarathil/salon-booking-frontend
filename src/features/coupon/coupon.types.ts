export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount: number;
  expiryDate: string;
  maxUsage: number;
  usedCount: number;
  maxDiscountAmount: number;
  isActive: boolean;
  isDeleted: boolean;
  applicableServices?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CouponState {
  coupons: Coupon[];
  pagination: PaginationInfo | null;
  availableCoupons: Coupon[];
  activeCoupon: Coupon | null;
  loading: boolean;
  error: string | null;
}

export interface CouponQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'DELETED';
}

export interface PaginatedCouponResponse {
  data: Coupon[];
  pagination: PaginationInfo;
}

export interface CreateCouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount?: number;
  expiryDate: string;
  maxUsage: number;
  maxDiscountAmount: number;
  applicableServices?: string[];
}
