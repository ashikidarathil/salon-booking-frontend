'use client';

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import { APP_ROUTES } from '@/common/constants/app.routes';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBookingDetails } from '@/features/booking/booking.thunks';

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useAppDispatch();
  const { currentBooking } = useAppSelector((state) => state.booking);

  useEffect(() => {
    if (bookingId) dispatch(fetchBookingDetails(bookingId));
  }, [bookingId, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6 sm:p-12">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="w-full p-8 sm:p-10 space-y-8 shadow-2xl shadow-slate-200/50 border-white/40 bg-white/80 backdrop-blur-sm rounded-[2.5rem]">
            {/* Elegant Failure Icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="size-24 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100/50"
              >
                <div className="size-16 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
                  <Icon icon="solar:danger-triangle-linear" className="size-10 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Refined Title Section */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Payment Unsuccessful
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                We couldn't process your transaction. Please check your payment details and try
                again.
              </p>
            </div>

            {/* Minimalist Booking ID */}
            <div className="flex flex-col items-center justify-center py-4 border-y border-slate-100/60">
              <span className="text-xs font-medium text-slate-400 mb-1">Booking Reference</span>
              <span className="text-xl font-mono font-semibold text-slate-700">
                #{currentBooking?.bookingNumber ?? bookingId?.slice(-6).toUpperCase()}
              </span>
            </div>

            {/* Info Box - Slot Protection */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100/50 flex gap-4 items-start shadow-sm">
              <div className="bg-amber-500/10 p-2.5 rounded-xl shrink-0">
                <Icon icon="solar:clock-circle-line-duotone" className="size-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 text-sm">
                  Slot reserved for 10 minutes
                </h4>
                <p className="text-xs text-amber-700/80 leading-relaxed mt-1">
                  Don't worry, your selected slot is still held for you. Navigate to "My Bookings"
                  to safely retry before the window expires.
                </p>
              </div>
            </div>

            {/* Soft CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-16 rounded-2xl text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium text-base"
                onClick={() => navigate('/')}
              >
                Return Home
              </Button>
              <Button
                className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all font-semibold text-base"
                onClick={() => navigate(APP_ROUTES.USER.BOOKINGS)}
              >
                Retry Payment
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
