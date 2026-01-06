import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { authService } from '../../services/auth.service';
import type { SignupPayload } from './authTypes';
import type { User } from './authTypes';

export const signup = createAsyncThunk<User, SignupPayload, { rejectValue: string }>(
  'auth/signup',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.signup(data);
      return res.data.user;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Signup failed');
      }
      return rejectWithValue('Signup failed');
    }
  },
);

export const verifyOtp = createAsyncThunk<
  User,
  { email: string; otp: string },
  { rejectValue: string }
>('auth/verifyOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.verifyOtp(data);
    return res.data.user;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
    }
    return rejectWithValue('OTP verification failed');
  }
});

export const verifySmsOtp = createAsyncThunk<
  { success: true },
  { phone: string; otp: string },
  { rejectValue: string }
>('auth/verifySmsOtp', async (payload, { rejectWithValue }) => {
  try {
    await authService.verifySmsOtp(payload);
    return { success: true };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
    }
    return rejectWithValue('Invalid OTP');
  }
});

export const resendEmailOtp = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/resendEmailOtp',
  async (email, { rejectWithValue }) => {
    try {
      await authService.resendEmailOtp({ email });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP');
      }
      return rejectWithValue('Failed to resend OTP');
    }
  },
);

export const resendSmsOtp = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/resendSmsOtp',
  async (phone, { rejectWithValue }) => {
    try {
      await authService.resendSmsOtp({ phone });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to resend SMS OTP');
      }
      return rejectWithValue('Failed to resend SMS OTP');
    }
  },
);

export const login = createAsyncThunk<
  User,
  { identifier: string; password: string; role: 'ADMIN' | 'USER' | 'STYLIST' },
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.login(payload);
    const user = res.data.data.user;

    sessionStorage.setItem('user_role', user.role);
    return user;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
    return rejectWithValue('Login failed');
  }
});

export const googleLogin = createAsyncThunk<User, { idToken: string }, { rejectValue: string }>(
  'auth/googleLogin',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.googleLogin(payload);
      return res.data.data.user;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Google login failed');
      }
      return rejectWithValue('Google login failed');
    }
  },
);

export const forgotPassword = createAsyncThunk<User, { email: string }, { rejectValue: string }>(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPassword(payload);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
      }
      return rejectWithValue('Failed to send OTP');
    }
  },
);

export const resendResetOtp = createAsyncThunk(
  'auth/resendResetOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.resendResetOtp({ email });
      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP');
      }
      return rejectWithValue('Failed to resend OTP');
    }
  },
);

export const verifyResetOtp = createAsyncThunk(
  'auth/verifyResetOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      await authService.verifyResetOtp({ email, otp });
      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
      }
      return rejectWithValue('Invalid OTP');
    }
  },
);

export const resetPassword = createAsyncThunk<
  User,
  { email: string; otp: string; newPassword: string },
  { rejectValue: string }
>('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.resetPassword(data);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Reset failed');
    }
    return rejectWithValue('Reset failed');
  }
});

export const fetchMe = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.me();

      if (!response.data.success) {
        return rejectWithValue('Failed to fetch user');
      }

      return response.data.data.user;
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        return rejectWithValue('Not authenticated');
      }
      return rejectWithValue('Failed to fetch user data');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  sessionStorage.removeItem('user_role');
});
