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
import type { BookingState, BookingItem } from './booking.types';

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
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<BookingItem[]>) => {
        state.loading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Booking Details
      .addCase(fetchBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetails.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reschedule Booking
      .addCase(rescheduleBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rescheduleBooking.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
        const index = state.myBookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      .addCase(rescheduleBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
        const index = state.myBookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Apply Coupon
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(removeCoupon.fulfilled, (state, action: PayloadAction<BookingItem>) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stylist Stats
      .addCase(fetchStylistStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStylistStats.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStylistStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Stylist Paginated Bookings
      .addCase(fetchStylistBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      // Admin/Stylist List/Today Bookings
      .addMatcher(
        (action) =>
          [
            fetchAdminBookings.pending.type,
            fetchStylistBookings.pending.type,
            fetchTodayBookings.pending.type,
            fetchStylistTodayBookings.pending.type,
          ].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => [fetchAdminBookings.fulfilled.type].includes(action.type),
        (state, action: PayloadAction<BookingItem[]>) => {
          state.loading = false;
          state.myBookings = action.payload;
          state.pagination = null; // Reset pagination for non-paginated lists
        },
      )
      .addMatcher(
        (action) =>
          [fetchTodayBookings.fulfilled.type, fetchStylistTodayBookings.fulfilled.type].includes(
            action.type,
          ),
        (state, action: PayloadAction<BookingItem[]>) => {
          state.loading = false;
          state.todayBookings = action.payload;
        },
      )
      .addMatcher(
        (action) =>
          [
            fetchAdminBookings.rejected.type,
            fetchStylistBookings.rejected.type,
            fetchTodayBookings.rejected.type,
            fetchStylistTodayBookings.rejected.type,
          ].includes(action.type),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearBookingError, resetBookingSuccess, resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
