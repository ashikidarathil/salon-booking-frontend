import { createSlice, isRejected, isPending } from '@reduxjs/toolkit';
import type { AuthState } from './authTypes';
import { login, logout, forgotPassword, resetPassword } from './authThunks';
import { getToken } from '../../utils/token';

const token = getToken();
const user = localStorage.getItem('user');

const initialState: AuthState = {
  user: user ? JSON.parse(user) : null,
  token: token,
  loading: false,
  error: null,
  isAuthenticated: !!token,

  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    restoreAuth(state) {
      const token = getToken();
      const user = localStorage.getItem('user');

      if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
      }
    },
  },

  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      state.isAuthenticated = true;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      state.isAuthenticated = false;
      state.forgotPasswordSuccess = false;
      state.resetPasswordSuccess = false;
    });

    builder
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.forgotPasswordSuccess = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.resetPasswordSuccess = true;
      });

    builder.addMatcher(isPending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addMatcher(isRejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Something went wrong';
    });
  },
});

export const { restoreAuth } = authSlice.actions;
export default authSlice.reducer;
