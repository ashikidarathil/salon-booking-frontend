import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

interface PaymentCountdownProps {
  /** ISO date string for when the payment window expires */
  expiresAt: string;
  /** Optional: whether to show a large variant (for CheckoutPage header) */
  variant?: 'badge' | 'header';
}

/**
 * Reusable live countdown timer for a booking's payment window.
 * - `badge` (default): compact pill used inside booking cards
 * - `header`: larger display used in the Checkout page header
 */
export function PaymentCountdown({ expiresAt, variant = 'badge' }: PaymentCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        setExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt]);

  if (variant === 'header') {
    return (
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${
          expired ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
        }`}
      >
        <Icon icon="solar:clock-circle-bold" className="size-5" />
        <span>{expired ? 'EXPIRED' : timeLeft}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold ${
        expired ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}
    >
      <Icon icon="solar:clock-circle-bold" className="size-3.5" />
      <span>{expired ? 'EXPIRED' : `Pay within ${timeLeft}`}</span>
    </div>
  );
}
