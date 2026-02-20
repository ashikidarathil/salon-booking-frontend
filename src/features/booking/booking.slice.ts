import { createSlice } from '@reduxjs/toolkit';
import type { BookingState } from './booking.types';
import { createBooking, fetchMyBookings, fetchBookingDetails, extendBooking } from './booking.thunks';

const initialState: BookingState = {
  myBookings: [],
  currentBooking: null,
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
      .addCase(createBooking.fulfilled, (state, action) => {
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
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
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
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Extend Booking
      .addCase(extendBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(extendBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
        // Update the booking in myBookings list if it exists
        const index = state.myBookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      .addCase(extendBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookingError, resetBookingSuccess, resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
