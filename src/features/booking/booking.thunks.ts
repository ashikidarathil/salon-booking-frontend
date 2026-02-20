import { createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '@/services/booking.service';
import type { CreateBookingDto } from '@/services/booking.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import type { BookingItem } from './booking.types';

export const createBooking = createAsyncThunk<
  BookingItem,
  CreateBookingDto,
  { rejectValue: string }
>('booking/createBooking', async (data, { rejectWithValue }) => {
  try {
    const res = await bookingService.createBooking(data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to create booking');
  }
});

export const fetchMyBookings = createAsyncThunk<BookingItem[], void, { rejectValue: string }>(
  'booking/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingService.getMyBookings();
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, 'Failed to fetch bookings');
    }
  },
);

export const fetchBookingDetails = createAsyncThunk<BookingItem, string, { rejectValue: string }>(
  'booking/fetchBookingDetails',
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await bookingService.getBookingDetails(bookingId);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, 'Failed to fetch booking details');
    }
  },
);

export const extendBooking = createAsyncThunk<
  BookingItem,
  { bookingId: string; additionalDuration: number },
  { rejectValue: string }
>('booking/extendBooking', async ({ bookingId, additionalDuration }, { rejectWithValue }) => {
  try {
    const res = await bookingService.extendBooking(bookingId, additionalDuration);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to extend booking');
  }
});
