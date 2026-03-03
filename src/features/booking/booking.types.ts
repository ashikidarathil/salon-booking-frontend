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

  rescheduleCount?: number;
  rescheduleReason?: string;
  cancelledBy?: string;
  cancelledReason?: string;
  cancelledAt?: string;
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

export interface BookingState {
  myBookings: BookingItem[];
  todayBookings: BookingItem[];
  currentBooking: BookingItem | null;
  pagination: PaginationMetadata | null;
  loading: boolean;
  error: string | null;
  bookingSuccess: boolean;
}
