import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { verifyResetOtp, resendResetOtp } from '../../features/auth/authThunks';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/common/utils/swal.utils';

export default function VerifyResetOtpPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector((state) => state.auth);

  const email = location.state?.email as string | undefined;

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);

  const canResend = timeLeft <= 0;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    if (!canResend || !email) return;

    const result = await dispatch(resendResetOtp(email));
    if (result.meta.requestStatus === 'fulfilled') {
      await showSuccess('OTP Resent!', 'New code sent to your email');
      setTimeLeft(60);
    } else {
      await showError('Failed to Resend', 'Please try again later');
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otp = digits.join('');
    if (otp.length !== 6 || !email) return;

    const result = await dispatch(verifyResetOtp({ email, otp }));
    if (verifyResetOtp.fulfilled.match(result)) {
      await showSuccess('OTP Verified!', 'Now set your new password');
      navigate('/new-password', { state: { email, otp } });
    } else {
      await showError('Invalid OTP', 'The code you entered is incorrect. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!email) return null;

  const otp = digits.join('');

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <Card className="w-full max-w-md border shadow-lg">
        <CardContent className="flex flex-col items-center pt-12 pb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-6 bg-primary rounded-2xl">
            <Icon icon="solar:shield-check-bold" className="size-8 text-primary-foreground" />
          </div>

          <h1 className="mb-2 text-2xl font-bold font-heading text-foreground">Verify OTP</h1>

          <p className="mb-8 text-muted-foreground">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>

          <div className="flex gap-3 mb-6">
            {digits.map((digit, i) => (
              <Input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 text-lg font-semibold text-center h-14 bg-input border-border focus:border-primary"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <p className="mb-2 text-sm text-muted-foreground">Code expires in</p>

          <p className="mb-8 text-3xl font-bold text-primary">{formatTime(timeLeft)}</p>

          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            Didn&apos;t receive code?{' '}
            <span
              onClick={handleResend}
              className={`font-semibold cursor-pointer ${
                canResend ? 'text-primary hover:underline' : 'text-muted-foreground'
              }`}
            >
              Resend {canResend ? '' : `(${formatTime(timeLeft)})`}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
