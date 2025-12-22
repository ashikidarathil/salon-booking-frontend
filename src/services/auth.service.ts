import { api } from './api';

export const authService = {
  signup(data: { name: string; email: string; password: string }) {
    return api.post('/auth/signup', data);
  },

  verifyOtp(data: { email: string; otp: string }) {
    return api.post('/auth/verify-otp', data);
  },

  login(data: { email: string; password: string }) {
    return api.post('/auth/login', data);
  },

  forgotPassword(data: { email: string }) {
    return api.post('/auth/forgot-password', data);
  },

  resetPassword(data: { email: string; otp: string; newPassword: string }) {
    return api.post('/auth/reset-password', data);
  },
};
