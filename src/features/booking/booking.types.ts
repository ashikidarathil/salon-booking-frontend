export interface BookingItem {
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

export interface BookingState {
  myBookings: BookingItem[];
  currentBooking: BookingItem | null;
  loading: boolean;
  error: string | null;
  bookingSuccess: boolean;
}
