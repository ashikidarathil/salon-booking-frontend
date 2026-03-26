import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { ReviewState } from '../review.types';
import {
  fetchReviews,
  createReviewThunk,
  deleteReviewThunk,
  restoreReviewThunk,
  fetchStylistRating,
  fetchTopStylists,
  fetchTopServices,
} from './review.thunks';

const initialState: ReviewState = {
  reviews: [],
  total: 0,
  topStylists: [],
  topServices: [],
  stats: {
    averageRating: 0,
    totalReviews: 0,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    resetReviewState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reviews
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.total = action.payload.total;
      })
      // Create Review
      .addCase(createReviewThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createReviewThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.reviews = [action.payload, ...state.reviews];
        state.total += 1;
      })
      // Delete Review
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        const review = state.reviews.find((r) => r.id === action.payload);
        if (review) {
          review.isDeleted = true;
        }
      })
      // Restore Review
      .addCase(restoreReviewThunk.fulfilled, (state, action) => {
        const review = state.reviews.find((r) => r.id === action.payload);
        if (review) {
          review.isDeleted = false;
        }
      })
      // Fetch Stylist Rating
      .addCase(fetchStylistRating.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Fetch Top Stylists
      .addCase(fetchTopStylists.fulfilled, (state, action) => {
        state.topStylists = action.payload;
      })
      // Fetch Top Services
      .addCase(fetchTopServices.fulfilled, (state, action) => {
        state.topServices = action.payload;
      })
      // Error handling
      .addMatcher(
        isAnyOf(
          fetchReviews.rejected,
          createReviewThunk.rejected,
          deleteReviewThunk.rejected,
          restoreReviewThunk.rejected,
          fetchStylistRating.rejected,
          fetchTopStylists.rejected,
          fetchTopServices.rejected,
        ),
        (state, action) => {
          state.isLoading = false;
          state.isSubmitting = false;
          state.error = action.payload as string;
        },
      );
  },
});

export const { clearReviewError, resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
