import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import type { SignupPayload, User } from './auth.types';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import { handleThunkError } from '@/common/utils/thunk.utils';

export const signup = createAsyncThunk<User, SignupPayload, { rejectValue: string }>(
  'auth/signup',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.signup(data);
      return res.data.data.user;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.CREATE_FAILED);
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
    return res.data.data.user;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
  }
});

export const verifySmsOtp = createAsyncThunk<
  { success: boolean },
  { phone: string; otp: string },
  { rejectValue: string }
>('auth/verifySmsOtp', async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.verifySmsOtp(payload);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
  }
});

export const resendEmailOtp = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/resendEmailOtp',
  async (email, { rejectWithValue }) => {
    try {
      await authService.resendEmailOtp({ email });
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);

export const resendSmsOtp = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/resendSmsOtp',
  async (phone, { rejectWithValue }) => {
    try {
      await authService.resendSmsOtp({ phone });
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
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
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.INVALID_CREDENTIALS);
  }
});

export const googleLogin = createAsyncThunk<User, { idToken: string }, { rejectValue: string }>(
  'auth/googleLogin',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.googleLogin(payload);
      return res.data.data.user;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);

export const forgotPassword = createAsyncThunk<
  { success: boolean; message?: string },
  { email: string },
  { rejectValue: string }
>('auth/forgotPassword', async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.forgotPassword(payload);
    return {
      success: res.data.success,
      message: res.data.message || 'Reset instructions sent',
    };
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
  }
});

export const resendResetOtp = createAsyncThunk<
  { success: boolean },
  string,
  { rejectValue: string }
>('auth/resendResetOtp', async (email, { rejectWithValue }) => {
  try {
    const res = await authService.resendResetOtp({ email });
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
  }
});

export const verifyResetOtp = createAsyncThunk<
  { success: boolean },
  { email: string; otp: string },
  { rejectValue: string }
>('auth/verifyResetOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const res = await authService.verifyResetOtp({ email, otp });
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
  }
});

export const resetPassword = createAsyncThunk<
  { success: boolean; message?: string },
  { email: string; otp: string; newPassword: string },
  { rejectValue: string }
>('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.resetPassword(data);
    return {
      success: res.data.success,
      message: res.data.message || 'Password reset successful',
    };
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
  }
});

export const fetchMe = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.me();

      if (!response.data.success) {
        return rejectWithValue(ERROR_MESSAGES.DATA_LOAD_FAILED);
      }

      return response.data.data.user;
    } catch (error) {
      return handleThunkError(error, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  sessionStorage.removeItem('user_role');
});
