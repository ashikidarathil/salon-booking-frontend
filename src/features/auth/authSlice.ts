import { createSlice, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';
import type { AuthState } from './auth.types';
import {
  login,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  fetchMe,
  signup,
  verifyOtp,
  verifySmsOtp,
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
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
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
      state.loading = false;
      state.error = null;
    });

    builder.addCase(fetchMe.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
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
      state.loading = false;
      state.error = null;
    });

    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.forgotPasswordSuccess = true;
    });

    builder.addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.resetPasswordSuccess = true;
    });

    builder.addCase(uploadProfilePicture.fulfilled, (state, action) => {
      if (state.user) {
        state.user.profilePicture = action.payload.profilePicture;
      }
    });

    builder.addCase(updateProfile.fulfilled, (state, action) => {
      if (state.user && action.payload.user) {
        // Update user with new profile data while preserving existing fields
        state.user.name = action.payload.user.name;
        if (action.payload.user.email) state.user.email = action.payload.user.email;
        if (action.payload.user.phone) state.user.phone = action.payload.user.phone;
      }
    });

    builder.addMatcher(
      isPending(signup, verifyOtp, verifySmsOtp, login, googleLogin, forgotPassword, resetPassword),
      (state) => {
        state.loading = true;
        state.error = null;
      },
    );

    builder.addMatcher(
      isFulfilled(
        signup,
        verifyOtp,
        verifySmsOtp,
        login,
        googleLogin,
        forgotPassword,
        resetPassword,
      ),
      (state) => {
        state.loading = false;
        state.error = null;
      },
    );

    builder.addMatcher(
      isRejected(
        signup,
        verifyOtp,
        verifySmsOtp,
        login,
        googleLogin,
        forgotPassword,
        resetPassword,
      ),
      (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Something went wrong';
      },
    );
  },
});

export const { clearError, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;
