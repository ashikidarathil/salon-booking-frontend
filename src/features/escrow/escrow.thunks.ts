import { createAsyncThunk } from '@reduxjs/toolkit';
import EscrowService from '../../services/escrow.service';
import { handleThunkError } from '../../common/utils/thunk.utils';

export const fetchAdminEscrows = createAsyncThunk(
  'escrow/fetchAdminEscrows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await EscrowService.getAdminEscrows();
      return response.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue);
    }
  }
);

export const fetchEscrowByBooking = createAsyncThunk(
  'escrow/fetchEscrowByBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await EscrowService.getEscrowByBooking(bookingId);
      return response.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue);
    }
  }
);
