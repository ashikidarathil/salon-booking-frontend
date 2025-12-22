import { createAsyncThunk } from '@reduxjs/toolkit';
import { setToken, clearToken } from '../../utils/token';
import type { AxiosError } from 'axios';
import { authService } from '../../services/auth.service';

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.signup(data);
      return res.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;

      return rejectWithValue(axiosError.response?.data?.message || 'Signup failed');
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await authService.verifyOtp(data);
      return res.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;

      return rejectWithValue(axiosError.response?.data?.message || 'OTP verification failed');
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(payload);
      const { token } = response.data.data;

      setToken(token);
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;

      return rejectWithValue(axiosError.response?.data?.message || 'Login failed');
    }
  },
);

/* FORGOT PASSWORD */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPassword(payload);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  },
);

/* RESET PASSWORD */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { email: string; otp: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const res = await authService.resetPassword(data);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || 'Reset failed');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  clearToken();
});
