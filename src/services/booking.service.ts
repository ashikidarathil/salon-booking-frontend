import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type {
  CreateBookingDto,
  BookingResponse,
  BookingListResponse,
  RescheduleBookingDto,
  ExtendBookingDto,
} from '@/features/booking/booking.types';

class BookingService {
  async createBooking(data: CreateBookingDto): Promise<BookingResponse> {
    const response = await api.post<BookingResponse>(API_ROUTES.BOOKING.BASE, data);
    return response.data;
  }

  async getMyBookings(): Promise<BookingListResponse> {
    const response = await api.get<BookingListResponse>(API_ROUTES.BOOKING.MY);
    return response.data;
  }

  async getBookingDetails(bookingId: string): Promise<BookingResponse> {
    const response = await api.get<BookingResponse>(API_ROUTES.BOOKING.BY_ID(bookingId));
    return response.data;
  }

  async listAllBookings(params: {
    branchId?: string;
    date?: string;
  }): Promise<BookingListResponse> {
    const response = await api.get<BookingListResponse>(API_ROUTES.BOOKING.ADMIN.LIST, { params });
    return response.data;
  }

  async listStylistBookings(params: { date?: string }): Promise<BookingListResponse> {
    const response = await api.get<BookingListResponse>(API_ROUTES.BOOKING.STYLIST.LIST, {
      params,
    });
    return response.data;
  }

  async extendBooking(bookingId: string, data: ExtendBookingDto): Promise<BookingResponse> {
    const response = await api.post<BookingResponse>(API_ROUTES.BOOKING.EXTEND(bookingId), data);
    return response.data;
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<BookingResponse> {
    const response = await api.patch<BookingResponse>(API_ROUTES.BOOKING.CANCEL(bookingId), {
      reason,
    });
    return response.data;
  }

  async rescheduleBooking(bookingId: string, data: RescheduleBookingDto): Promise<BookingResponse> {
    const response = await api.patch<BookingResponse>(
      API_ROUTES.BOOKING.RESCHEDULE(bookingId),
      data,
    );
    return response.data;
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<BookingResponse> {
    const response = await api.patch<BookingResponse>(API_ROUTES.BOOKING.STATUS(bookingId), {
      status,
    });
    return response.data;
  }

  async getTodayBookings(branchId?: string): Promise<BookingListResponse> {
    const response = await api.get<BookingListResponse>(API_ROUTES.BOOKING.ADMIN.TODAY, {
      params: { branchId },
    });
    return response.data;
  }

  async getStylistTodayBookings(): Promise<BookingListResponse> {
    const response = await api.get<BookingListResponse>(API_ROUTES.BOOKING.STYLIST.TODAY);
    return response.data;
  }
}

export const bookingService = new BookingService();
