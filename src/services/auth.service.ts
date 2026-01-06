import { api } from './api';
import type { SignupPayload } from '@/features/auth/authTypes';

export const authService = {
  signup(data: SignupPayload) {
    return api.post('/auth/signup', data);
  },

  verifyOtp(data: { email: string; otp: string }) {
    return api.post('/auth/verify-otp', data);
  },

  verifySmsOtp(data: { phone: string; otp: string }) {
    return api.post('/auth/sms/verify-signup-otp', data);
  },
  resendEmailOtp(data: { email: string }) {
    return api.post('/auth/resend-email-otp', data);
  },

  resendSmsOtp(data: { phone: string }) {
    return api.post('/auth/resend-sms-otp', data);
  },
  login(data: { identifier: string; password: string; role: string }) {
    return api.post('/auth/login', data);
  },

  googleLogin(data: { idToken: string }) {
    return api.post('/auth/google', data);
  },

  me() {
    return api.get('/auth/me');
  },

  logout() {
    return api.post('/auth/logout');
  },

  forgotPassword(data: { email: string }) {
    return api.post('/auth/forgot-password', data);
  },

  resendResetOtp(data: { email: string }) {
    return api.post('/auth/resend-reset-otp', data);
  },

  verifyResetOtp(data: { email: string; otp: string }) {
    return api.post('/auth/verify-reset-otp', data);
  },

  resetPassword(data: { email: string; otp: string; newPassword: string }) {
    return api.post('/auth/reset-password', data);
  },
};
