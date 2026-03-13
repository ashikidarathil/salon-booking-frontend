import { createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '@/services/booking.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { BOOKING_MESSAGES } from './booking.constants';
import type {
  BookingItem,
  CreateBookingDto,
  RescheduleBookingDto,
  PaginationMetadata,
} from './booking.types';

export const createBooking = createAsyncThunk<
  BookingItem,
  CreateBookingDto,
  { rejectValue: string }
>('booking/createBooking', async (data, { rejectWithValue }) => {
  try {
    const res = await bookingService.createBooking(data);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.CREATE_FAILED);
  }
});

export const fetchMyBookings = createAsyncThunk<BookingItem[], void, { rejectValue: string }>(
  'booking/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingService.getMyBookings();
      return res.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.FETCH_FAILED);
    }
  },
);

export const fetchBookingDetails = createAsyncThunk<BookingItem, string, { rejectValue: string }>(
  'booking/fetchBookingDetails',
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await bookingService.getBookingDetails(bookingId);
      return res.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.DETAILS_FAILED);
    }
  },
);

export const fetchAdminBookings = createAsyncThunk<
  BookingItem[],
  { branchId?: string; date?: string },
  { rejectValue: string }
>('booking/fetchAdminBookings', async (params, { rejectWithValue }) => {
  try {
    const res = await bookingService.listAllBookings(params);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.ADMIN_FETCH_FAILED);
  }
});

export const fetchStylistBookings = createAsyncThunk<
  { data: BookingItem[]; pagination: PaginationMetadata },
  { page?: number; limit?: number; search?: string; date?: string },
  { rejectValue: string }
>('booking/fetchStylistBookings', async (params, { rejectWithValue }) => {
  try {
    const res = await bookingService.listStylistBookings(params);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.STYLIST_FETCH_FAILED);
  }
});

export const rescheduleBooking = createAsyncThunk<
  BookingItem,
  { bookingId: string; data: RescheduleBookingDto },
  { rejectValue: string }
>('booking/rescheduleBooking', async ({ bookingId, data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.rescheduleBooking(bookingId, data);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.RESCHEDULE_FAILED);
  }
});

export const cancelBooking = createAsyncThunk<
  BookingItem,
  { bookingId: string; reason?: string },
  { rejectValue: string }
>('booking/cancelBooking', async ({ bookingId, reason }, { rejectWithValue }) => {
  try {
    const res = await bookingService.cancelBooking(bookingId, reason);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.CANCEL_FAILED);
  }
});

export const updateBookingStatus = createAsyncThunk<
  BookingItem,
  { bookingId: string; status: string },
  { rejectValue: string }
>('booking/updateStatus', async ({ bookingId, status }, { rejectWithValue }) => {
  try {
    const res = await bookingService.updateBookingStatus(bookingId, status);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.STATUS_UPDATE_FAILED);
  }
});

export const fetchTodayBookings = createAsyncThunk<
  BookingItem[],
  { branchId?: string },
  { rejectValue: string }
>('booking/fetchTodayBookings', async (params, { rejectWithValue }) => {
  try {
    const res = await bookingService.getTodayBookings(params.branchId);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.TODAY_FETCH_FAILED);
  }
});

export const fetchStylistTodayBookings = createAsyncThunk<
  BookingItem[],
  void,
  { rejectValue: string }
>('booking/fetchStylistTodayBookings', async (_, { rejectWithValue }) => {
  try {
    const res = await bookingService.getStylistTodayBookings();
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, BOOKING_MESSAGES.TODAY_FETCH_FAILED);
  }
});

export const applyCoupon = createAsyncThunk<
  BookingItem,
  { bookingId: string; code: string },
  { rejectValue: string }
>('booking/applyCoupon', async ({ bookingId, code }, { rejectWithValue }) => {
  try {
    const res = await bookingService.applyCoupon(bookingId, code);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to apply coupon');
  }
});

export const removeCoupon = createAsyncThunk<
  BookingItem,
  string,
  { rejectValue: string }
>('booking/removeCoupon', async (bookingId, { rejectWithValue }) => {
  try {
    const res = await bookingService.removeCoupon(bookingId);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to remove coupon');
  }
});

export const fetchStylistStats = createAsyncThunk<
  any,
  { period?: string; date?: string } | void,
  { rejectValue: string }
>('booking/fetchStylistStats', async (params, { rejectWithValue }) => {
  try {
    const { period, date } = (params as { period?: string; date?: string }) || {};
    const res = await bookingService.getStylistStats(period, date);
    return res.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, 'Failed to fetch dashboard statistics');
  }
});
