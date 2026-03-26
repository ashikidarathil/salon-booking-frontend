import { createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../review.service';
import type { CreateReviewDto, ReviewPaginationParams } from '../review.types';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { REVIEW_MESSAGES } from '../constants/review.messages';

export const fetchReviews = createAsyncThunk(
  'review/fetchReviews',
  async (params: ReviewPaginationParams, { rejectWithValue }) => {
    try {
      return await reviewService.getReviews(params);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, REVIEW_MESSAGES.FETCH_ERROR);
    }
  },
);

export const createReviewThunk = createAsyncThunk(
  'review/createReview',
  async (data: CreateReviewDto, { rejectWithValue }) => {
    try {
      return await reviewService.createReview(data);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, REVIEW_MESSAGES.CREATE_ERROR);
    }
  },
);

export const deleteReviewThunk = createAsyncThunk(
  'review/deleteReview',
  async (id: string, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(id);
      return id;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, REVIEW_MESSAGES.DELETE_ERROR);
    }
  },
);

export const restoreReviewThunk = createAsyncThunk(
  'review/restoreReview',
  async (id: string, { rejectWithValue }) => {
    try {
      await reviewService.restoreReview(id);
      return id;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, REVIEW_MESSAGES.RESTORE_ERROR);
    }
  },
);

export const fetchStylistRating = createAsyncThunk(
  'review/fetchStylistRating',
  async (stylistId: string, { rejectWithValue }) => {
    try {
      return await reviewService.getStylistRating(stylistId);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, REVIEW_MESSAGES.FETCH_STATS_ERROR);
    }
  },
);

export const fetchTopStylists = createAsyncThunk(
  'review/fetchTopStylists',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      return await reviewService.getTopStylists(limit);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, REVIEW_MESSAGES.FETCH_STATS_ERROR);
    }
  },
);

export const fetchTopServices = createAsyncThunk(
  'review/fetchTopServices',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      return await reviewService.getTopServices(limit);
    } catch (error) {
      return handleThunkError(error, rejectWithValue, REVIEW_MESSAGES.FETCH_STATS_ERROR);
    }
  },
);
