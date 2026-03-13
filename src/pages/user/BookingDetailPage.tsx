import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBookingDetails, cancelBooking } from '@/features/booking/booking.thunks';
import { processRemainingPayment, payRemainingWithWallet } from '@/features/payment/payment.thunks';
import { fetchMyWallet } from '@/features/wallet/wallet.thunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import {
  showApiError,
  showSuccess,
  showCancellationConfirm,
  showError,
} from '@/common/utils/swal.utils';
import {
  BookingStatus,
  PaymentStatus,
  BOOKING_MESSAGES,
  BOOKING_RULES,
} from '@/features/booking/booking.constants';

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return 'bg-green-100 text-green-700 border-green-200';
    case BookingStatus.PENDING_PAYMENT:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case BookingStatus.CANCELLED:
      return 'bg-red-100 text-red-700 border-red-200';
    case BookingStatus.COMPLETED:
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case BookingStatus.NO_SHOW:
      return 'bg-gray-200 text-gray-600 border-gray-300';
    case BookingStatus.FAILED:
      return 'bg-red-50 text-red-500 border-red-100';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const StatusIcon: Record<string, string> = {
  CONFIRMED: 'solar:check-circle-bold-duotone',
  PENDING_PAYMENT: 'solar:clock-circle-bold-duotone',
  CANCELLED: 'solar:close-circle-bold-duotone',
  COMPLETED: 'solar:verified-check-bold-duotone',
  NO_SHOW: 'solar:ghost-bold-duotone',
  FAILED: 'solar:close-circle-bold-duotone',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBooking, loading } = useAppSelector((state) => state.booking);
  const { loading: paymentLoading } = useAppSelector((state) => state.payment);
  const { wallet } = useAppSelector((state) => state.wallet);
  const [remainingPayMethod, setRemainingPayMethod] = useState<'razorpay' | 'wallet'>('razorpay');

  useEffect(() => {
    if (id) dispatch(fetchBookingDetails(id));
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(fetchMyWallet());
  }, [dispatch]);

  const checkLeadTime = (bookingDate: string, startTime: string) => {
    try {
      const dt = new Date(bookingDate);
      const [h, m] = startTime.split(':').map(Number);
      dt.setHours(h, m, 0, 0);

      const diffMs = dt.getTime() - new Date().getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      return diffHrs >= BOOKING_RULES.LEAD_TIME_HOURS;
    } catch {
      return false;
    }
  };

  const handleCancel = async () => {
    if (!currentBooking) return;
    if (!checkLeadTime(currentBooking.date, currentBooking.startTime)) {
      showApiError(BOOKING_MESSAGES.LEAD_TIME_ERROR, 'Cannot Cancel');
      return;
    }
    const reason = await showCancellationConfirm();
    if (reason) {
      const result = await dispatch(cancelBooking({ bookingId: currentBooking.id, reason }));
      if (cancelBooking.fulfilled.match(result))
        showSuccess('Cancelled!', BOOKING_MESSAGES.CANCEL_SUCCESS);
    }
  };

  const handleReschedule = async () => {
    if (!currentBooking) return;
    if (!checkLeadTime(currentBooking.date, currentBooking.startTime)) {
      showApiError(BOOKING_MESSAGES.LEAD_TIME_ERROR, 'Cannot Reschedule');
      return;
    }
    if ((currentBooking.rescheduleCount ?? 0) >= BOOKING_RULES.MAX_RESCHEDULES) {
      showApiError(BOOKING_MESSAGES.RESCHEDULE_LIMIT_REACHED, 'Limit Reached');
      return;
    }
    navigate('/profile/bookings');
  };

  const handlePayRemaining = async () => {
    if (!currentBooking?.id) return;
    if (remainingPayMethod === 'wallet') {
      const result = await dispatch(payRemainingWithWallet({ bookingId: currentBooking.id }));
      if (payRemainingWithWallet.fulfilled.match(result)) {
        showSuccess('Paid!', 'Remaining balance paid via wallet.');
        dispatch(fetchBookingDetails(currentBooking.id));
      } else {
        showError('Payment Failed', (result.payload as string) || 'Wallet payment failed');
      }
    } else {
      const result = await dispatch(processRemainingPayment({ bookingId: currentBooking.id }));
      if (processRemainingPayment.fulfilled.match(result)) {
        if (result.payload.status === 'success') {
          showSuccess('Paid!', 'Remaining balance paid successfully.');
          dispatch(fetchBookingDetails(currentBooking.id));
        }
      } else {
        showError('Payment Failed', (result.payload as string) || 'Payment processing failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon icon="solar:loading-bold-duotone" className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!currentBooking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <Icon icon="solar:calendar-minimalistic-broken" className="size-16 opacity-40" />
        <p className="text-lg font-medium">Booking not found</p>
        <Button onClick={() => navigate('/profile/bookings')} variant="outline">
          Back to Bookings
        </Button>
      </div>
    );
  }

  const b = currentBooking;
  const canAct = b.status === BookingStatus.CONFIRMED && checkLeadTime(b.date, b.startTime);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md mt-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <Icon icon="solar:arrow-left-linear" className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-heading">Booking Details</h1>
          <p className="text-muted-foreground text-sm">#{b.bookingNumber}</p>
        </div>
        <div className="ml-auto">
          <Badge className={getStatusColor(b.status as BookingStatus)}>
            <Icon
              icon={StatusIcon[b.status] || 'solar:calendar-bold-duotone'}
              className="size-3 mr-1"
            />
            {b.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Date & Time Card */}
      <Card>
        <CardContent className="p-5 mt-5">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:calendar-bold-duotone" className="size-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {format(new Date(b.date), 'EEEE, MMMM do yyyy')}
              </p>
              {/* <p className="text-muted-foreground">{b.startTime} – {b.endTime}</p> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon icon="solar:scissors-square-bold-duotone" className="size-5 text-primary" />
            Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {b.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40"
            >
              <div>
                <p className="font-medium text-sm">{item.serviceName || 'Professional Service'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Icon icon="solar:user-bold-duotone" className="size-3" />
                  {item.stylistName}
                  <span className="mx-1">·</span>
                  {item.date ? format(new Date(item.date), 'dd MMM') : ''} {item.startTime}–
                  {item.endTime}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">₹{item.price.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">{item.duration} min</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon icon="solar:bill-list-bold-duotone" className="size-5 text-primary" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4 mt-5">
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Amount</span>
              <span className="font-medium">₹{b.totalPrice.toLocaleString('en-IN')}</span>
            </div>
            {(b.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-red-600 text-sm font-medium">
                <span>Coupon Discount</span>
                <span>- ₹{b.discountAmount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 border-t border-dashed pt-2.5">
              <span>Net Total</span>
              <span className="text-lg">₹{b.payableAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                Advance Paid (20%)
              </p>
              <p className="text-xl font-black text-primary">
                ₹{b.advanceAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                To Pay at Salon (80%)
              </p>
              <p className="text-xl font-black text-slate-700">
                ₹{(b.payableAmount - b.advanceAmount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed">
            <span className="text-muted-foreground italic">Payment Status</span>
            <Badge variant="outline" className="font-bold uppercase tracking-tight text-[10px]">
              {b.paymentStatus.replace('_', ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Booking Notes if any */}
      {b.notes && (
        <Card className="bg-yellow-50/50 border-yellow-100">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-1">Customer Notes</p>
            <p className="text-sm text-slate-600">"{b.notes}"</p>
          </CardContent>
        </Card>
      )}

      {/* Pay Remaining Balance */}
      {b.status === BookingStatus.COMPLETED && b.paymentStatus === PaymentStatus.ADVANCE_PAID && (
        <Card className="border-primary/10 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <Icon icon="solar:wallet-money-bold-duotone" className="size-5" />
              Pay Remaining Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">Final Balance (80%)</span>
              <span className="text-2xl font-black text-primary">
                ₹{(b.payableAmount - b.advanceAmount).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={remainingPayMethod === 'razorpay' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs h-9"
                onClick={() => setRemainingPayMethod('razorpay')}
              >
                <Icon icon="solar:card-2-bold" className="size-3.5 mr-1" /> Razorpay
              </Button>
              <Button
                variant={remainingPayMethod === 'wallet' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs h-9"
                onClick={() => setRemainingPayMethod('wallet')}
              >
                <Icon icon="solar:wallet-bold" className="size-3.5 mr-1" />
                Wallet {wallet ? `(₹${wallet.balance})` : ''}
              </Button>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11"
              onClick={handlePayRemaining}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <Icon icon="eos-icons:loading" className="size-4 animate-spin" />
              ) : (
                `Complete Payment · ₹${(b.payableAmount - b.advanceAmount).toLocaleString('en-IN')}`
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {canAct && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 text-blue-600 hover:bg-blue-50 border-blue-100"
            onClick={handleReschedule}
            disabled={(b.rescheduleCount ?? 0) >= BOOKING_RULES.MAX_RESCHEDULES}
          >
            <Icon icon="solar:calendar-rotate-linear" className="size-4" />
            Reschedule
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 text-red-600 hover:bg-red-50 border-red-100"
            onClick={handleCancel}
          >
            <Icon icon="solar:close-circle-linear" className="size-4" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
