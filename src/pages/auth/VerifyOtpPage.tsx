import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { verifyOtp } from '../../features/auth/authThunks';

export default function VerifyOtpPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email as string | undefined;

  const [otp, setOtp] = useState('');

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-background">
        <div className="p-6 text-center border rounded-lg bg-card">
          <p className="text-sm text-destructive">Email missing. Please signup again.</p>
        </div>
      </div>
    );
  }

  const handleVerify = async () => {
    const result = await dispatch(verifyOtp({ email, otp }));

    if (verifyOtp.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify OTP</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter the OTP sent to</p>
          <p className="mt-1 text-sm font-medium">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              className="w-full px-3 py-2 text-sm tracking-widest text-center border rounded-md border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            className="w-full px-4 py-2 text-sm font-medium transition rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
}
