import { api } from './api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type { SignupPayload, User } from '@/features/auth/auth.types';

export const authService = {
  signup(data: SignupPayload) {
    return api.post<ApiResponse<{ user: User }>>(API_ROUTES.AUTH.SIGNUP, data);
  },

  verifyOtp(data: { email: string; otp: string }) {
    return api.post<ApiResponse<{ user: User }>>(API_ROUTES.AUTH.VERIFY_OTP, data);
  },

  verifySmsOtp(data: { phone: string; otp: string }) {
    return api.post<ApiResponse<{ success: boolean }>>(API_ROUTES.AUTH.VERIFY_SMS_OTP, data);
  },

  resendEmailOtp(data: { email: string }) {
    return api.post<ApiResponse<{ success: boolean }>>(API_ROUTES.AUTH.RESEND_EMAIL_OTP, data);
  },

  resendSmsOtp(data: { phone: string }) {
    return api.post<ApiResponse<{ success: boolean }>>(API_ROUTES.AUTH.RESEND_SMS_OTP, data);
  },

  login(data: { identifier: string; password: string; role: string }) {
    return api.post<ApiResponse<{ user: User }>>(API_ROUTES.AUTH.LOGIN, data);
  },

  googleLogin(data: { idToken: string }) {
    return api.post<ApiResponse<{ user: User }>>(API_ROUTES.AUTH.GOOGLE_LOGIN, data);
  },

  me() {
    return api.get<ApiResponse<{ user: User }>>(API_ROUTES.AUTH.ME);
  },

  logout() {
    return api.post<ApiResponse<{ success: boolean }>>(API_ROUTES.AUTH.LOGOUT);
  },

  forgotPassword(data: { email: string }) {
    return api.post<ApiResponse<{ user: User }>>(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
  },

  resendResetOtp(data: { email: string }) {
    return api.post<ApiResponse<{ success: boolean }>>(API_ROUTES.AUTH.RESEND_RESET_OTP, data);
  },

  verifyResetOtp(data: { email: string; otp: string }) {
    return api.post<ApiResponse<{ success: boolean }>>(API_ROUTES.AUTH.VERIFY_RESET_OTP, data);
  },

  resetPassword(data: { email: string; otp: string; newPassword: string }) {
    return api.post<ApiResponse<{ user: User }>>(API_ROUTES.AUTH.RESET_PASSWORD, data);
  },
};
