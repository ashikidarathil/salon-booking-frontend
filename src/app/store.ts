import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import stylistInviteReducer from '../features/stylistInvite/stylistInviteSlice';
import profileReducer from '@/features/profile/profileSlice';
import userReducer from '@/features/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stylistInvite: stylistInviteReducer,
    profile: profileReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
