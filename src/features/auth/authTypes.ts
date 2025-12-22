// features/auth/authTypes.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'STYLIST';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  forgotPasswordSuccess: boolean;
  resetPasswordSuccess: boolean;
}
