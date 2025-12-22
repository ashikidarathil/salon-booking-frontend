import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

const token = localStorage.getItem('auth_token');

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: {
      user: null,
      token,
      loading: false,
      error: null,
    },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
