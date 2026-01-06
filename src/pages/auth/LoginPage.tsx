// frontend/src/pages/user/LoginPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login, googleLogin } from '@/features/auth/authThunks';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getErrorInfo, useAuthValidation } from '@/utils/authErrorHelper';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, error, loading } = useAppSelector((state) => state.auth);
  const { validateIdentifier, validatePassword } = useAuthValidation();

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleBlur = (field: 'identifier' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'identifier') {
      setFieldErrors((prev) => ({
        ...prev,
        identifier: validateIdentifier(identifier),
      }));
    } else if (field === 'password') {
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(password),
      }));
    }
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);

    if (touched.identifier) {
      setFieldErrors((prev) => ({
        ...prev,
        identifier: validateIdentifier(value),
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (touched.password) {
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  const isFormValid = () => {
    return !validateIdentifier(identifier) && !validatePassword(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ identifier: true, password: true });

    const identifierError = validateIdentifier(identifier);
    const passwordError = validatePassword(password);

    setFieldErrors({
      identifier: identifierError,
      password: passwordError,
    });

    if (!identifierError && !passwordError) {
      // Normalize phone number for backend
      let loginIdentifier = identifier.trim();
      const digitsOnly = loginIdentifier.replace(/\D/g, '');

      if (digitsOnly.length === 10) {
        loginIdentifier = '+91' + digitsOnly;
      } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        loginIdentifier = '+' + digitsOnly;
      }

      dispatch(login({ identifier: loginIdentifier, password, role: 'USER' }));
    }
  };

  const errorInfo = getErrorInfo(error);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === 'USER') navigate('/', { replace: true });
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-background">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">User Login</h1>
          <p className="mt-1 text-xs text-muted-foreground">Welcome back! Please login</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('email')}
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
            onClick={() => setMode('phone')}
            className={`flex-1 py-2 border rounded transition-colors font-medium ${
              mode === 'phone'
                ? 'bg-red-400 text-white border-red-400'
                : 'bg-white text-foreground border-gray-300 hover:border-gray-400'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Error Message */}
        {errorInfo && (
          <div
            className={`flex gap-3 p-4 mb-6 border rounded-lg ${errorInfo.bgColor} ${errorInfo.borderColor}`}
          >
            <errorInfo.icon className={`w-5 h-5 ${errorInfo.iconColor} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`font-semibold ${errorInfo.textColor}`}>{errorInfo.title}</p>
              <p className={`text-sm mt-1 ${errorInfo.textColor}`}>{errorInfo.message}</p>
              <p className={`text-xs mt-2 opacity-75 ${errorInfo.textColor}`}>{errorInfo.detail}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              {mode === 'email' ? 'Email' : 'Phone Number'}
            </label>
            <input
              placeholder={mode === 'email' ? 'you@example.com' : '+91 XXXXX XXXXX'}
              autoComplete={mode === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={handleIdentifierChange}
              onBlur={() => handleBlur('identifier')}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md transition-colors disabled:opacity-50 ${
                touched.identifier && fieldErrors.identifier
                  ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400'
              }`}
            />
            {touched.identifier && fieldErrors.identifier && (
              <div className="flex gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{fieldErrors.identifier}</p>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                disabled={loading}
                className={`w-full px-3 py-2 pr-10 border rounded-md transition-colors disabled:opacity-50 ${
                  touched.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 disabled:opacity-50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-3 font-medium text-white transition-colors bg-red-400 rounded hover:bg-red-500 disabled:bg-red-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="mt-4 text-sm text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-red-400 hover:text-red-500">
            Sign up here
          </Link>
        </div>

        {/* Google Login */}
        <div className="flex justify-center w-full mt-6">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              dispatch(googleLogin({ idToken: credentialResponse.credential! }));
            }}
            onError={() => {
              console.log('Google Login Failed');
            }}
          />
        </div>
      </div>
    </div>
  );
}
