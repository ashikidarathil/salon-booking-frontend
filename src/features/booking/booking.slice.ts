import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  createBooking,
  fetchMyBookings,
  fetchBookingDetails,
  rescheduleBooking,
  cancelBooking,
  fetchAdminBookings,
  fetchStylistBookings,
  updateBookingStatus,
  fetchTodayBookings,
  fetchStylistTodayBookings,
  applyCoupon,
  removeCoupon,
  fetchStylistStats,
} from './booking.thunks';
import type { BookingState, BookingItem, StylistStats } from './booking.types';

const initialState: BookingState = {
  myBookings: [],
  todayBookings: [],
  currentBooking: null,
  stats: null,
  pagination: null,
  loading: false,
  error: null,
  bookingSuccess: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    resetBookingSuccess: (state) => {
      state.bookingSuccess = false;
    },
    resetBookingState: (state) => {
      state.currentBooking = null;
      state.bookingSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
        state.bookingSuccess = true;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch My Bookings
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<BookingItem[]>) => {
        state.loading = false;
        state.myBookings = action.payload;
      })

      // Fetch Booking Details
      .addCase(fetchBookingDetails.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })

      // Reschedule Booking
      .addCase(rescheduleBooking.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
        const index = state.myBookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })

      // Cancel Booking
      .addCase(cancelBooking.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
        const index = state.myBookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })

      // Update Status
      .addCase(updateBookingStatus.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
        const idx = state.myBookings.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.myBookings[idx] = action.payload;
        const tidx = state.todayBookings.findIndex((b) => b.id === action.payload.id);
        if (tidx !== -1) state.todayBookings[tidx] = action.payload;
      })

      // Coupons
      .addCase(applyCoupon.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(removeCoupon.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })

      // Fetch Stylist Stats
      .addCase(fetchStylistStats.fulfilled, (state, action: PayloadAction<StylistStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })

      // Stylist Paginated Bookings
      .addCase(fetchStylistBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload.data;
        state.pagination = action.payload.pagination;
      })

      // Shared Pending Matcher
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.startsWith('booking/'),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )

      // Shared Rejected Matcher
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('booking/'),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        },
      )

      // Shared Results Matcher for Lists
      .addMatcher(
        (action) =>
          [
            fetchAdminBookings.fulfilled.type,
            fetchTodayBookings.fulfilled.type,
            fetchStylistTodayBookings.fulfilled.type,
          ].includes(action.type),
        (state, action: PayloadAction<BookingItem[]>) => {
          state.loading = false;
          if (action.type === fetchAdminBookings.fulfilled.type) {
            state.myBookings = action.payload;
            state.pagination = null;
          } else {
            state.todayBookings = action.payload;
          }
        },
      );
  },
});

export const { clearBookingError, resetBookingSuccess, resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
