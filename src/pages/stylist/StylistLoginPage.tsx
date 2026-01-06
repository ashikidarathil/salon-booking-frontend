// frontend/src/pages/stylist/StylistLoginPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login } from '@/features/auth/authThunks';
import { AlertCircle, Eye, EyeOff } from 'lucide-react'; // ← Added EyeOff
import { getErrorInfo, useAuthValidation } from '@/utils/authErrorHelper';

export default function StylistLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, error, loading } = useAppSelector((s) => s.auth);
  const { validateIdentifier, validatePassword } = useAuthValidation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ← NEW STATE
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({ identifier: '', password: '' });

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
      dispatch(login({ identifier, password, role: 'STYLIST' }));
    }
  };

  const errorInfo = getErrorInfo(error);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === 'STYLIST') navigate('/stylist', { replace: true });
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 border rounded-lg bg-card">
        <h1 className="mb-6 text-2xl font-semibold text-center">Stylist Login</h1>

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
          {/* Email/Phone Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">Email</label>
            <input
              placeholder="example@email.com"
              autoComplete="username"
              value={identifier}
              onChange={handleIdentifierChange}
              onBlur={() => handleBlur('identifier')}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md transition-colors disabled:opacity-50 ${
                touched.identifier && fieldErrors.identifier
                  ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            />
            {touched.identifier && fieldErrors.identifier && (
              <div className="flex gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{fieldErrors.identifier}</p>
              </div>
            )}
          </div>

          {/* Password Field - NOW WITH TOGGLE EYE */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} // ← Toggle type
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                disabled={loading}
                className={`w-full px-3 py-2 pr-10 border rounded-md transition-colors disabled:opacity-50 ${
                  touched.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
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
            className="w-full py-2 font-medium text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Help Text */}
        <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-600">
            <strong>Account issues?</strong> If your account is blocked, not verified, or pending
            approval, please contact the administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
