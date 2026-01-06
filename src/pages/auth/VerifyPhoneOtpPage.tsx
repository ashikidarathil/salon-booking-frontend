import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { verifySmsOtp, resendSmsOtp } from '../../features/auth/authThunks';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showSuccess ,showError} from '@/utils/swal';

export default function VerifyPhoneOtpPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector((state) => state.auth);

  const phone = location.state?.phone as string | undefined;

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);

  // ✅ derived state (NO useState needed)
  const canResend = timeLeft <= 0;

  // ⏱️ countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    if (!canResend || !phone) return;

    const cleanPhone = '+' + phone.replace(/\D/g, '');
    const result = await dispatch(resendSmsOtp(cleanPhone));

    if (result.meta.requestStatus === 'fulfilled') {
      await showSuccess('OTP Resent!', 'New code sent to your phone');
      setTimeLeft(60);
    } else {
      await showError('Failed to resend OTP', 'Please try again');
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

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== 6 || !phone) return;

    const cleanPhone = '+' + phone.replace(/\D/g, '');
    const result = await dispatch(verifySmsOtp({ phone: cleanPhone, otp }));

    if (verifySmsOtp.fulfilled.match(result)) {
      await showSuccess('Phone Verified Successfully!', 'Welcome to SalonBook!');
      navigate('/login');
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!phone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-destructive">Phone missing. Please sign up again.</p>
      </div>
    );
  }

  const otp = digits.join('');

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <Card className="w-full max-w-md border shadow-lg">
        <CardContent className="flex flex-col items-center pt-12 pb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-6 bg-primary rounded-2xl">
            <Icon icon="solar:shield-check-bold" className="size-8 text-primary-foreground" />
          </div>

          <h1 className="mb-2 text-2xl font-bold font-heading text-foreground">
            Verify Your Number
          </h1>

          <p className="mb-8 text-muted-foreground">
            Enter the 6-digit code sent to <strong>{phone}</strong>
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
            onClick={handleVerify}
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
