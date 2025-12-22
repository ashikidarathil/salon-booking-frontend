import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { resetPassword } from '../../features/auth/authThunks';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { loading, error, resetPasswordSuccess } = useAppSelector((state) => state.auth);

  const email = location.state?.email as string | undefined;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  /* Redirect if email missing */
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!email) return;

    setLocalError(null);
    dispatch(resetPassword({ email, otp, newPassword }));
  };

  /* Success redirect */
  useEffect(() => {
    if (resetPasswordSuccess) {
      navigate('/login');
    }
  }, [resetPasswordSuccess, navigate]);

  if (!email) return null;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter the OTP and set a new password</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP */}
          <div className="space-y-1">
            <label className="text-sm font-medium">OTP</label>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border rounded-md border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium">New Password</label>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border rounded-md border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border rounded-md border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Error */}
          {(localError || error) && (
            <p className="text-sm text-destructive">{localError || error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium transition rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
