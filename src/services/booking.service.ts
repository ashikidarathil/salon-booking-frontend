import { api } from '@/services/api/api';
import { BOOKING_ROUTES } from '@/features/booking/booking.routes';
import type {
  CreateBookingDto,
  BookingResponse,
  BookingListResponse,
  PaginatedBookingResponse,
  RescheduleBookingDto,
  StylistStatsResponse,
} from '@/features/booking/booking.types';

export const bookingService = {
  createBooking: async (data: CreateBookingDto): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(BOOKING_ROUTES.BASE, data);
    return response.data;
  },

  getMyBookings: async (): Promise<BookingListResponse> => {
    const response = await api.get<BookingListResponse>(BOOKING_ROUTES.MY);
    return response.data;
  },

  getBookingDetails: async (bookingId: string): Promise<BookingResponse> => {
    const response = await api.get<BookingResponse>(BOOKING_ROUTES.BY_ID(bookingId));
    return response.data;
  },

  listAllBookings: async (params: {
    branchId?: string;
    date?: string;
  }): Promise<BookingListResponse> => {
    const response = await api.get<BookingListResponse>(BOOKING_ROUTES.ADMIN.LIST, { params });
    return response.data;
  },

  listStylistBookings: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    date?: string;
  }): Promise<PaginatedBookingResponse> => {
    const response = await api.get<PaginatedBookingResponse>(BOOKING_ROUTES.STYLIST.LIST, {
      params,
    });
    return response.data;
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<BookingResponse> => {
    const response = await api.patch<BookingResponse>(BOOKING_ROUTES.CANCEL(bookingId), {
      reason,
    });
    return response.data;
  },

  rescheduleBooking: async (
    bookingId: string,
    data: RescheduleBookingDto,
  ): Promise<BookingResponse> => {
    const response = await api.patch<BookingResponse>(BOOKING_ROUTES.RESCHEDULE(bookingId), data);
    return response.data;
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<BookingResponse> => {
    const response = await api.patch<BookingResponse>(BOOKING_ROUTES.STATUS(bookingId), {
      status,
    });
    return response.data;
  },

  getTodayBookings: async (branchId?: string): Promise<BookingListResponse> => {
    const response = await api.get<BookingListResponse>(BOOKING_ROUTES.ADMIN.TODAY, {
      params: { branchId },
    });
    return response.data;
  },

  getStylistTodayBookings: async (): Promise<BookingListResponse> => {
    const response = await api.get<BookingListResponse>(BOOKING_ROUTES.STYLIST.TODAY);
    return response.data;
  },

  getStylistStats: async (period?: string, date?: string): Promise<StylistStatsResponse> => {
    const response = await api.get<StylistStatsResponse>(BOOKING_ROUTES.STYLIST.STATS, {
      params: { period, date },
    });
    return response.data;
  },

  applyCoupon: async (bookingId: string, code: string): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(BOOKING_ROUTES.APPLY_COUPON(bookingId), {
      code,
    });
    return response.data;
  },

  removeCoupon: async (bookingId: string): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(BOOKING_ROUTES.REMOVE_COUPON(bookingId));
    return response.data;
  },
};
