import { createSlice, type PayloadAction, type SerializedError } from '@reduxjs/toolkit';
import type { AuthState } from './auth.types';
import {
  login,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  fetchMe,
} from './authThunks';

import { uploadProfilePicture, updateProfile } from '@/features/profile/profileThunks';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserFromToken: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Login failed';
      state.isAuthenticated = false;
      state.user = null;
    });

    builder.addCase(googleLogin.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    builder.addCase(fetchMe.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.forgotPasswordSuccess = false;
      state.resetPasswordSuccess = false;
    });

    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.forgotPasswordSuccess = true;
    });

    builder.addCase(resetPassword.fulfilled, (state) => {
      state.resetPasswordSuccess = true;
    });

    builder.addCase(uploadProfilePicture.fulfilled, (state, action) => {
      if (state.user) {
        state.user.profilePicture = action.payload.profilePicture;
      }
    });

    builder.addCase(updateProfile.fulfilled, (state, action) => {
      if (state.user && action.payload.user) {
        state.user.name = action.payload.user.name;
        if (action.payload.user.email) state.user.email = action.payload.user.email;
        if (action.payload.user.phone) state.user.phone = action.payload.user.phone;
      }
    });

    builder
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<unknown, string, unknown, SerializedError> =>
          action.type.startsWith('auth/') &&
          action.type.endsWith('/rejected') &&
          action.type !== fetchMe.rejected.type,
        (state, action) => {
          state.loading = false;
          state.error = (action.payload as string) || action.error.message || 'Something went wrong';
        },
      );
  },
});

export const { clearError, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;
