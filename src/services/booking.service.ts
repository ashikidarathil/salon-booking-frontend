import { api } from '@/services/api/api';
import type { AxiosResponse } from 'axios';

export interface CreateBookingDto {
  slotId: string;
  serviceId: string;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  userId: string;
  branchId: string;
  slotId: string;
  serviceId: string;
  stylistId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
}

class BookingService {
  async createBooking(data: CreateBookingDto): Promise<AxiosResponse<{ data: BookingResponse }>> {
    return api.post('/bookings', data);
  }

  async getMyBookings(): Promise<AxiosResponse<{ data: BookingResponse[] }>> {
    return api.get('/bookings/my');
  }

  async getBookingDetails(bookingId: string): Promise<AxiosResponse<{ data: BookingResponse }>> {
    return api.get(`/bookings/${bookingId}`);
  }

  async extendBooking(bookingId: string, additionalDuration: number): Promise<AxiosResponse<{ data: BookingResponse }>> {
    return api.post(`/bookings/${bookingId}/extend`, { additionalDuration });
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<AxiosResponse<{ data: BookingResponse }>> {
    return api.patch(`/bookings/${bookingId}/cancel`, { reason });
  }
}

export const bookingService = new BookingService();
