// features/auth/authTypes.ts
export interface User {
  id: string;
  name: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  password?: string;
  googleId?: string;
  authProvider?: 'LOCAL' | 'GOOGLE';
  profilePicture?: string | null; // ✅ IMPORTANT
  role: 'USER' | 'ADMIN' | 'STYLIST';
  isActive?: boolean;
  isBlocked?: boolean;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  forgotPasswordSuccess: boolean;
  resetPasswordSuccess: boolean;
}

export type SignupPayload =
  | {
      name: string;
      email: string;
      password: string;
    }
  | {
      name: string;
      phone: string;
      password: string;
    };
