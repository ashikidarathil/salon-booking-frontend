import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { resetPassword } from '../../features/auth/authThunks';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/common/utils/swal.utils';

export default function NewPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error: serverError } = useAppSelector((state) => state.auth);

  const email = location.state?.email as string | undefined;
  const otp = location.state?.otp as string | undefined;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Errors
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);

    if (value.length === 0) {
      setNewPasswordError(null);
    } else if (value.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
    } else if (!/(?=.*[a-z])/.test(value)) {
      setNewPasswordError('Must contain a lowercase letter');
    } else if (!/(?=.*[A-Z])/.test(value)) {
      setNewPasswordError('Must contain an uppercase letter');
    } else if (!/(?=.*\d)/.test(value)) {
      setNewPasswordError('Must contain a number');
    } else if (!/(?=.*[@$!%*?&])/.test(value)) {
      setNewPasswordError('Must contain a special character (@$!%*?&)');
    } else {
      setNewPasswordError(null);
    }
  };

  // Validate confirm password on change
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    if (value.length === 0) {
      setConfirmPasswordError(null);
    } else if (value !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPasswordError || confirmPasswordError || !newPassword || !confirmPassword) {
      return;
    }

    const result = await dispatch(resetPassword({ email: email!, otp: otp!, newPassword }));

    if (resetPassword.fulfilled.match(result)) {
      await showSuccess('Password Reset Successful!', 'You can now login with your new password');
      navigate('/login');
    } else {
      await showError('Reset Failed', serverError || 'Something went wrong. Please try again');
    }
  };

  if (!email || !otp) return null;

  const isFormValid =
    !newPasswordError &&
    !confirmPasswordError &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <Card className="w-full max-w-md border shadow-lg">
        <CardContent className="flex flex-col items-center pt-12 pb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-6 bg-primary rounded-2xl">
            <Icon icon="solar:lock-bold" className="size-8 text-primary-foreground" />
          </div>

          <h1 className="mb-2 text-2xl font-bold font-heading text-foreground">
            Create New Password
          </h1>
          <p className="mb-8 text-muted-foreground">
            Your new password must be strong and different from previous ones
          </p>

          <form onSubmit={handleResetPassword} className="w-full space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon
                    icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    className="size-5"
                  />
                </button>
              </div>
              {newPasswordError && (
                <div className="flex gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{newPasswordError}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
              />
              {confirmPasswordError && (
                <div className="flex gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{confirmPasswordError}</p>
                </div>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="flex gap-2 p-3 border rounded-lg bg-destructive/10 border-destructive/20">
                <AlertCircle className="flex-shrink-0 w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            {/* Password Requirements */}
            <div className="space-y-1 text-xs text-left text-muted-foreground">
              <p className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                ✓ At least 8 characters
              </p>
              <p className={/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : ''}>
                ✓ One lowercase letter
              </p>
              <p className={/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : ''}>
                ✓ One uppercase letter
              </p>
              <p className={/(?=.*\d)/.test(newPassword) ? 'text-green-600' : ''}>✓ One number</p>
              <p className={/(?=.*[@$!%*?&])/.test(newPassword) ? 'text-green-600' : ''}>
                ✓ One special character (@$!%*?&)
              </p>
              <p
                className={
                  newPassword === confirmPassword && confirmPassword ? 'text-green-600' : ''
                }
              >
                ✓ Passwords match
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Remember your password?{' '}
            <span
              onClick={() => navigate('/login')}
              className="font-semibold cursor-pointer text-primary hover:underline"
            >
              Back to Login
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
