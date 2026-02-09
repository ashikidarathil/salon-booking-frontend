import { AlertCircle, Clock, LockIcon, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ERROR_MESSAGES } from '../constants/error.messages';

export type ErrorType = 'blocked' | 'notVerified' | 'pending' | 'invalid' | 'role' | 'default';

export interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  detail: string;
  icon: LucideIcon;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}

const ERROR_CONFIGS: Record<ErrorType, ErrorInfo> = {
  blocked: {
    type: 'blocked',
    title: 'Account Blocked',
    message: 'Your account has been blocked by the admin.',
    detail: 'Please contact the administrator for assistance.',
    icon: ShieldAlert,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
  notVerified: {
    type: 'notVerified',
    title: 'Account Not Verified',
    message: 'Your email or phone needs to be verified.',
    detail: 'Please verify your email or phone to activate your account.',
    icon: Clock,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-600',
  },
  pending: {
    type: 'pending',
    title: '⏳ Awaiting Admin Approval',
    message: 'Your account is still under review.',
    detail: 'The admin will approve your account soon. Please try again later.',
    icon: Clock,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
  invalid: {
    type: 'invalid',
    title: 'Invalid Credentials',
    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    detail: 'Please check your credentials and try again.',
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
  role: {
    type: 'role',
    title: 'Unauthorized Access',
    message: ERROR_MESSAGES.FORBIDDEN,
    detail: 'Please log in with the correct account type.',
    icon: LockIcon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
  default: {
    type: 'default',
    title: 'Operation Failed',
    message: ERROR_MESSAGES.OPERATION_FAILED,
    detail: 'Please try again or contact support.',
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
};

export const getErrorType = (error: string | null): ErrorType => {
  if (!error) return 'default';

  const errorLower = error.toLowerCase();

  if (errorLower.includes('blocked')) {
    return 'blocked';
  }

  if (
    errorLower.includes('verify email') ||
    errorLower.includes('verify phone') ||
    errorLower.includes('not active')
  ) {
    return 'notVerified';
  }

  if (
    errorLower.includes('pending') ||
    errorLower.includes('applied') ||
    errorLower.includes('approval') ||
    errorLower.includes('not approved')
  ) {
    return 'pending';
  }

  if (errorLower.includes('invalid') || errorLower.includes('credentials')) {
    return 'invalid';
  }

  if (errorLower.includes('role') || errorLower.includes('unauthorized')) {
    return 'role';
  }

  return 'default';
};

export const getErrorInfo = (error: string | null): ErrorInfo | null => {
  if (!error) return null;

  const errorType = getErrorType(error);
  const config = ERROR_CONFIGS[errorType];

  if (errorType === 'default') {
    return {
      ...config,
      message: error,
    };
  }

  return config;
};

export const validateEmail = (email: string): string => {
  if (!email.trim()) return ERROR_MESSAGES.REQUIRED_FIELD;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ERROR_MESSAGES.INVALID_EMAIL;
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) return ERROR_MESSAGES.REQUIRED_FIELD;
  if (password.length < 6) return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
  return '';
};

export const validateIdentifier = (value: string): string => {
  if (!value.trim()) return ERROR_MESSAGES.REQUIRED_FIELD;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[\d\s-()]{10,}$/;

  if (!emailRegex.test(value) && !phoneRegex.test(value)) {
    return 'Please enter a valid email or phone number';
  }

  return '';
};

export const useAuthValidation = () => {
  return {
    validateIdentifier,
    validatePassword,
  };
};
