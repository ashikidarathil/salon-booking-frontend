import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login } from '@/features/auth/authThunks';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getErrorInfo, useAuthValidation } from '@/common/utils/auth.utils';

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, error, loading } = useAppSelector((s) => s.auth);
  const { validateIdentifier, validatePassword } = useAuthValidation();

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

  // ✅ Handle input change
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

  // ✅ Check if form is valid
  const isFormValid = () => {
    return !validateIdentifier(identifier) && !validatePassword(password);
  };

  // ✅ Handle form submission
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
      dispatch(login({ identifier, password, role: 'ADMIN' }));
    }
  };

  // ✅ Get error info from helper (reusing utility)
  const errorInfo = getErrorInfo(error);

  // ✅ Redirect on successful login
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === 'ADMIN') navigate('/admin', { replace: true });
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 border rounded-lg bg-card">
        <h1 className="mb-6 text-2xl font-semibold text-center">Admin Login</h1>

        {/* ✅ Error Message (using helper) */}
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
          {/* ✅ Email Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">Email Address</label>
            <input
              placeholder="admin@example.com"
              type="email"
              autoComplete="username"
              value={identifier}
              onChange={handleIdentifierChange}
              onBlur={() => handleBlur('identifier')}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md transition-colors disabled:opacity-50 ${
                touched.identifier && fieldErrors.identifier
                  ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500'
              }`}
            />
            {touched.identifier && fieldErrors.identifier && (
              <div className="flex gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{fieldErrors.identifier}</p>
              </div>
            )}
          </div>

          {/* ✅ Password Field */}
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
                className={`w-full px-3 py-2 border rounded-md transition-colors disabled:opacity-50 pr-10 ${
                  touched.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500'
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

          {/* ✅ Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-2 font-medium text-white transition-colors bg-green-500 rounded-md hover:bg-green-600 disabled:bg-green-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* ✅ Security Info */}
        <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-600">
            <strong>Admin Access:</strong> This section is restricted to administrators only.
            Unauthorized access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
