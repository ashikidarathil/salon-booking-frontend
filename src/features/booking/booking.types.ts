import { BookingStatus, PaymentStatus } from './booking.constants';

export interface BookingItemInput {
  serviceId: string;
  stylistId: string;
  date: string;
  startTime: string;
  slotId: string;
}

export interface CreateBookingDto {
  slotId?: string;
  items: BookingItemInput[];
  notes?: string;
}

export interface RescheduleBookingDto {
  items: BookingItemInput[];
  reason?: string;
}

export interface BookingDetailsItem {
  serviceId: string;
  serviceName?: string;
  serviceImageUrl?: string;
  stylistId: string;
  stylistName?: string;
  price: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingItem {
  id: string;
  bookingNumber: string;
  userId: string;
  userName?: string;
  branchId: string;
  slotId?: string;
  serviceIds?: string[];
  items: BookingDetailsItem[];
  stylistId: string;
  stylistName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  discountAmount?: number;
  payableAmount: number;
  advanceAmount: number;
  couponId?: string;
  rescheduleCount?: number;
  rescheduleReason?: string;
  cancelledBy?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  paymentWindowExpiresAt?: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  data: BookingItem;
  message: string;
}

export interface StylistService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BookingListResponse {
  success: boolean;
  data: BookingItem[];
  message: string;
}

export interface PaginatedBookingResponse {
  success: boolean;
  data: {
    data: BookingItem[];
    pagination: PaginationMetadata;
  };
  message: string;
}

export interface StylistStats {
  summary: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
    revenue: number;
  };
  chartData: {
    label: string;
    bookings: number;
    revenue: number;
  }[];
  statusBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  period: string;
  range: {
    start: string;
    end: string;
  };
}

export interface BookingState {
  myBookings: BookingItem[];
  todayBookings: BookingItem[];
  currentBooking: BookingItem | null;
  stats: StylistStats | null;
  pagination: PaginationMetadata | null;
  loading: boolean;
  error: string | null;
  bookingSuccess: boolean;
}
