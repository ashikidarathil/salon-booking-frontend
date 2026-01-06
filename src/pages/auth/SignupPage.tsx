// frontend/src/pages/auth/SignupPage.tsx

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { signup, googleLogin } from '@/features/auth/authThunks';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { showSuccess } from '@/utils/swal';

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const validateName = (value: string): string => {
    if (!value.trim()) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '').slice(2);
    if (digitsOnly.length !== 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';

    const checks = [
      { test: /[A-Z]/, message: 'At least one uppercase letter' },
      { test: /[a-z]/, message: 'At least one lowercase letter' },
      { test: /[0-9]/, message: 'At least one number' },
      { test: /[!@#$%^&*]/, message: 'At least one special character (!@#$%^&*)' },
    ];

    for (const check of checks) {
      if (!check.test.test(value)) return check.message;
    }

    return '';
  };

  const validateConfirmPassword = (pwd: string, confirm: string): string => {
    if (!confirm) return 'Please confirm your password';
    if (pwd !== confirm) return 'Passwords do not match';
    return '';
  };

  const formatPhoneNumber = (value: string): string => {
    let digits = value.replace(/\D/g, '');

    if (digits.startsWith('91')) {
      digits = digits.slice(2);
    }

    digits = digits.slice(0, 10);

    if (digits.length === 0) return '+91 ';

    if (digits.length <= 5) {
      return `+91 ${digits}`;
    }

    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof typeof form) => {
    let error = '';

    switch (field) {
      case 'name':
        error = validateName(form.name);
        break;
      case 'email':
        if (mode === 'email') error = validateEmail(form.email);
        break;
      case 'phone':
        if (mode === 'phone') error = validatePhone(form.phone);
        break;
      case 'password':
        error = validatePassword(form.password);
        if (form.confirmPassword)
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
          }));
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(form.password, form.confirmPassword);
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let finalValue = value;

    if (name === 'phone') {
      finalValue = formatPhoneNumber(value);
    }

    setForm((prev) => ({ ...prev, [name]: finalValue }));

    if (touched[name as keyof typeof touched]) {
      validateField(name as keyof typeof form);
    }
  };

  const isFormValid = (): boolean => {
    const nameError = validateName(form.name);
    const identifierError =
      mode === 'email' ? validateEmail(form.email) : validatePhone(form.phone);
    const passwordError = validatePassword(form.password);
    const confirmError = validateConfirmPassword(form.password, form.confirmPassword);

    return !nameError && !identifierError && !passwordError && !confirmError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid()) return;

    const payload =
      mode === 'email'
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : {
            name: form.name.trim(),
            phone: '+' + form.phone.replace(/\D/g, ''),
            password: form.password,
          };

    const result = await dispatch(signup(payload));

    if (signup.fulfilled.match(result)) {
      await showSuccess(
        'Account Created Successfully!',
        mode === 'email'
          ? 'Check your email for the verification OTP'
          : 'Check your phone for the verification OTP',
      );

      if (mode === 'email') {
        navigate('/verify-otp', { state: { email: form.email } });
      } else {
        navigate('/verify-phone-otp', { state: { phone: form.phone } });
      }
    }
  };

  const redirectByRole = (role: string) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'STYLIST') navigate('/stylist');
    else navigate('/');
  };

  const isPhoneAlreadyUsed =
    error &&
    error.toLowerCase().includes('phone') &&
    (error.toLowerCase().includes('already') ||
      error.toLowerCase().includes('exists') ||
      error.toLowerCase().includes('registered'));

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-background">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <p className="mt-1 text-xs text-muted-foreground">Sign up to get started</p>
        </div>

        {/* Mode Switch */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('email');
              setFieldErrors((prev) => ({ ...prev, phone: '' }));
            }}
            className={`flex-1 py-2 border rounded transition-colors font-medium ${
              mode === 'email'
                ? 'bg-red-400 text-white border-red-400'
                : 'bg-white text-foreground border-gray-300 hover:border-gray-400'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('phone');
              setFieldErrors((prev) => ({ ...prev, email: '' }));
            }}
            className={`flex-1 py-2 border rounded transition-colors font-medium ${
              mode === 'phone'
                ? 'bg-red-400 text-white border-red-400'
                : 'bg-white text-foreground border-gray-300 hover:border-gray-400'
            }`}
          >
            Phone
          </button>
        </div>

        {error && !isPhoneAlreadyUsed && (
          <div className="p-3 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded transition-colors disabled:opacity-50 ${
                touched.name && fieldErrors.name
                  ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400'
              }`}
            />
            {touched.name && fieldErrors.name && (
              <div className="flex gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{fieldErrors.name}</p>
              </div>
            )}
          </div>

          {/* Email or Phone */}
          {mode === 'email' ? (
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded transition-colors disabled:opacity-50 ${
                  touched.email && fieldErrors.email
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400'
                }`}
              />
              {touched.email && fieldErrors.email && (
                <div className="flex gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{fieldErrors.email}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                placeholder="+91 XXXXX XXXXX"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded transition-colors disabled:opacity-50 ${
                  touched.phone && fieldErrors.phone
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400'
                }`}
              />
              {touched.phone && fieldErrors.phone && (
                <div className="flex gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{fieldErrors.phone}</p>
                </div>
              )}
              {isPhoneAlreadyUsed && (
                <div className="flex gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>This mobile number is already registered</p>
                </div>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Enter your 10-digit mobile number
              </p>
            </div>
          )}

          {/* Password */}
          {/* <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                disabled={loading}
                className={`w-full px-3 py-2 pr-10 border rounded transition-colors disabled:opacity-50 ${
                  touched.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <div className="flex gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{fieldErrors.password}</p>
              </div>
            )}
          </div> */}

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                disabled={loading}
                className={`w-full px-3 py-2 pr-10 border rounded transition-colors disabled:opacity-50 ${
                  touched.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {touched.password && (
              <div className="mt-3 space-y-1">
                {[
                  { valid: form.password.length >= 8, text: 'At least 8 characters' },
                  { valid: /[A-Z]/.test(form.password), text: 'One uppercase letter' },
                  { valid: /[a-z]/.test(form.password), text: 'One lowercase letter' },
                  { valid: /[0-9]/.test(form.password), text: 'One number' },
                  {
                    valid: /[!@#$%^&*]/.test(form.password),
                    text: 'One special character (!@#$%^&*)',
                  },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {rule.valid ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                    <span className={rule.valid ? 'text-green-600' : 'text-red-600'}>
                      {rule.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {touched.password && fieldErrors.password && (
              <div className="flex gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{fieldErrors.password}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded transition-colors disabled:opacity-50 ${
                touched.confirmPassword && fieldErrors.confirmPassword
                  ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400'
              }`}
            />
            {touched.confirmPassword && fieldErrors.confirmPassword && (
              <div className="flex gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{fieldErrors.confirmPassword}</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-3 mt-6 font-medium text-white bg-red-400 rounded hover:bg-red-500 disabled:bg-red-300 disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* Google Login */}
          <div className="mt-6">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (res) => {
                  const result = await dispatch(googleLogin({ idToken: res.credential! }));
                  if (googleLogin.fulfilled.match(result)) {
                    redirectByRole(result.payload.role);
                  }
                }}
                onError={() => console.log('Google Login Failed')}
              />
            </div>
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-sm text-center">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-red-400 hover:text-red-500">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
