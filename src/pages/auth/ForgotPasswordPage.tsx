import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { forgotPassword } from '../../features/auth/authThunks';
import { showSuccess, showError, showLoading, closeLoading } from '@/common/utils/swal.utils';

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, forgotPasswordSuccess } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    showLoading('Sending reset instructions...');

    const result = await dispatch(forgotPassword({ email: email.trim() }));

    closeLoading();

    if (forgotPassword.fulfilled.match(result)) {
      await showSuccess(
        'Check Your Email!',
        'We have sent a password reset OTP to your email address.',
      );
      navigate('/verify-reset-otp', { state: { email: email.trim() } });
    } else {
      await showError('Failed to Send', error || 'Please check your email and try again');
    }
  };

  useEffect(() => {
    if (forgotPasswordSuccess) {
      navigate('/verify-reset-otp', { state: { email } });
    }
  }, [forgotPasswordSuccess, navigate, email]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-8 text-center border shadow-lg rounded-2xl bg-card">
        {/* Icon */}
        <div className="flex items-center justify-center mx-auto mb-4 h-14 w-14 rounded-xl bg-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.121 14.121L19 19M5 5l5.879 5.879m0 0L5 19m5.879-5.879L19 5"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="mb-1 text-2xl font-semibold font-heading">Forgot Password?</h2>

        {/* Subtitle */}
        <p className="mb-6 text-sm text-muted-foreground">
          Enter your email address and we’ll send you a link to reset your password
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-sm text-muted-foreground">
          Back to{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
