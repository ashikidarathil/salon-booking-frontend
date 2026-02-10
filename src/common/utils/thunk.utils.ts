import axios from 'axios';
import { ERROR_MESSAGES } from '../constants/error.messages';

/**
 * Utility to handle axios errors in createAsyncThunk
 * @param err The error object from catch block
 * @param rejectWithValue rejectWithValue from thunkAPI
 * @param defaultMessage Optional default error message
 */
export const handleThunkError = <T>(
  err: unknown,
  rejectWithValue: (value: string) => T,
  defaultMessage: string = ERROR_MESSAGES.OPERATION_FAILED
): T => {
  if (axios.isAxiosError(err)) {
    return rejectWithValue(err.response?.data?.message || defaultMessage);
  }
  return rejectWithValue(defaultMessage);
};
