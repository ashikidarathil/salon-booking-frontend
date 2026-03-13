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

export default function PaymentSuccessPage() {
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
            {/* Elegant Success Icon */}
            <div className="flex justify-center">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="size-24 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100/50"
              >
                <div className="size-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Icon icon="solar:check-read-linear" className="size-10 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Refined Title Section */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Booking Confirmed
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                Thank you! Your payment was successful and your appointment is scheduled.
              </p>
            </div>

            {/* Minimalist Booking ID */}
            <div className="flex flex-col items-center justify-center py-4 border-y border-slate-100/60">
              <span className="text-xs font-medium text-slate-400 mb-1">Booking Reference</span>
              <span className="text-xl font-mono font-semibold text-slate-700">
                #{currentBooking?.bookingNumber ?? bookingId?.slice(-6).toUpperCase()}
              </span>
            </div>

            {/* Minimalist Booking Summary */}
            {currentBooking && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {currentBooking.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 transition-colors hover:bg-slate-50"
                    >
                      {item.serviceImageUrl ? (
                        <img
                          src={item.serviceImageUrl}
                          alt={item.serviceName}
                          className="size-14 rounded-xl object-cover shadow-sm bg-white"
                        />
                      ) : (
                        <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Icon icon="solar:scissors-outline" className="size-7 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 text-base truncate">
                          {item.serviceName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm text-slate-500">{item.stylistName}</span>
                        </div>
                        {item.date && (
                          <p className="text-xs text-primary font-medium mt-1">
                            {new Date(item.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                            {' · '}
                            {item.startTime}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/40">
                    <p className="text-[11px] font-medium text-emerald-600 mb-1">Paid Advance</p>
                    <p className="text-2xl font-semibold text-emerald-700">
                      ₹{currentBooking.advanceAmount}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/40 border border-slate-100/40">
                    <p className="text-[11px] font-medium text-slate-500 mb-1">Payable at Salon</p>
                    <p className="text-2xl font-semibold text-slate-700">
                      ₹{currentBooking.payableAmount - currentBooking.advanceAmount}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Soft CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-16 rounded-2xl text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium text-base"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
              <Button
                className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all font-semibold text-base"
                onClick={() => navigate(APP_ROUTES.USER.BOOKINGS)}
              >
                View Bookings
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
