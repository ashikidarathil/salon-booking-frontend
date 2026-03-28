import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBookingDetails, cancelBooking } from '@/features/booking/booking.thunks';
import { fetchBranchById } from '@/features/branch/branch.thunks';
import { processRemainingPayment, payRemainingWithWallet } from '@/features/payment/payment.thunks';
import { fetchMyWallet } from '@/features/wallet/wallet.thunks';
import { PAYMENT_MESSAGES as PM } from '@/features/payment/payment.constants';
import { ReviewModal } from '@/features/review/components/ReviewModal';
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
import { LoadingGate } from '@/components/common/LoadingGate';
import type { BookingDetailsItem } from '@/features/booking/booking.types';

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
  [BookingStatus.CONFIRMED]: 'solar:check-circle-bold-duotone',
  [BookingStatus.PENDING_PAYMENT]: 'solar:clock-circle-bold-duotone',
  [BookingStatus.CANCELLED]: 'solar:close-circle-bold-duotone',
  [BookingStatus.COMPLETED]: 'solar:verified-check-bold-duotone',
  [BookingStatus.NO_SHOW]: 'solar:ghost-bold-duotone',
  [BookingStatus.FAILED]: 'solar:close-circle-bold-duotone',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBooking, loading, error } = useAppSelector((state) => state.booking);
  const { selectedBranch, loading: branchLoading } = useAppSelector((state) => state.branch);
  const { loading: paymentLoading } = useAppSelector((state) => state.payment);
  const { wallet } = useAppSelector((state) => state.wallet);
  const [remainingPayMethod, setRemainingPayMethod] = useState<'razorpay' | 'wallet'>('razorpay');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchBookingDetails(id));
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(fetchMyWallet());
  }, [dispatch]);

  useEffect(() => {
    if (currentBooking?.branchId && selectedBranch?.id !== currentBooking.branchId) {
      dispatch(fetchBranchById(currentBooking.branchId));
    }
  }, [currentBooking?.branchId, selectedBranch?.id, dispatch]);

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
      if (cancelBooking.fulfilled.match(result)) {
        showSuccess('Cancelled!', BOOKING_MESSAGES.CANCEL_SUCCESS);
      }
    }
  };

  const handleReschedule = () => {
    if (!currentBooking) return;
    if (!checkLeadTime(currentBooking.date, currentBooking.startTime)) {
      showApiError(BOOKING_MESSAGES.LEAD_TIME_ERROR, 'Cannot Reschedule');
      return;
    }
    if ((currentBooking.rescheduleCount ?? 0) >= BOOKING_RULES.MAX_RESCHEDULES) {
      showApiError(BOOKING_MESSAGES.RESCHEDULE_LIMIT_REACHED, 'Limit Reached');
      return;
    }
    // Redirect to bookings page to initiate reschedule from the list where the dialog is available
    navigate('/profile/bookings');
  };

  const handlePayRemaining = async () => {
    if (!currentBooking?.id) return;
    if (remainingPayMethod === 'wallet') {
      const result = await dispatch(payRemainingWithWallet({ bookingId: currentBooking.id }));
      if (payRemainingWithWallet.fulfilled.match(result)) {
        showSuccess('Paid!', PM.REMAINING_WALLET_SUCCESS);
        dispatch(fetchBookingDetails(currentBooking.id));
      } else {
        showError('Payment Failed', (result.payload as string) || PM.REMAINING_WALLET_FAILED);
      }
    } else {
      const result = await dispatch(processRemainingPayment({ bookingId: currentBooking.id }));
      if (processRemainingPayment.fulfilled.match(result)) {
        if (result.payload.status === 'success') {
          showSuccess('Paid!', PM.REMAINING_SUCCESS);
          dispatch(fetchBookingDetails(currentBooking.id));
        }
      } else {
        showError('Payment Failed', (result.payload as string) || PM.REMAINING_PAY_FAILED);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-foreground">
      <LoadingGate
        loading={loading}
        error={error}
        data={currentBooking}
        emptyMessage="Booking not found"
        emptyIcon="solar:calendar-minimalistic-broken"
      >
        {currentBooking && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <Icon icon="solar:arrow-left-linear" className="size-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-heading">Booking Details</h1>
                <p className="text-muted-foreground text-sm">#{currentBooking.bookingNumber}</p>
              </div>
              <div className="ml-auto">
                <Badge className={getStatusColor(currentBooking.status as BookingStatus)}>
                  <Icon
                    icon={StatusIcon[currentBooking.status] || 'solar:calendar-bold-duotone'}
                    className="size-3 mr-1"
                  />
                  {currentBooking.status.replace('_', ' ')}
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
                      {format(new Date(currentBooking.date), 'EEEE, MMMM do yyyy')}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {currentBooking.startTime} – {currentBooking.endTime}
                    </p>
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
                {currentBooking.items.map((item: BookingDetailsItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {item.serviceName || 'Professional Service'}
                      </p>
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

            {/* Salon Location */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <Icon icon="solar:map-point-bold-duotone" className="size-5 text-primary" />
                <CardTitle className="text-base m-0">Salon Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40 min-h-[64px]">
                  {branchLoading ? (
                    <div className="flex items-center gap-3 w-full animate-pulse">
                      <div className="size-10 rounded-full bg-primary/10 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon icon="solar:shop-bold-duotone" className="size-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {selectedBranch?.name || 'Salon details unavailable'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {selectedBranch?.address || 'Address not listed'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {!branchLoading && selectedBranch?.latitude && selectedBranch?.longitude && (
                  <Button
                    variant="default"
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-bold h-11"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.latitude},${selectedBranch.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <Icon icon="solar:routing-bold-duotone" className="size-5" />
                    Get Directions
                  </Button>
                )}
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
                    <span className="font-medium">
                      ₹{currentBooking.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {(currentBooking.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-red-600 text-sm font-medium">
                      <span>Coupon Discount</span>
                      <span>- ₹{currentBooking.discountAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 border-t border-dashed pt-2.5">
                    <span>Net Total</span>
                    <span className="text-lg">
                      ₹{currentBooking.payableAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                      Advance Paid (20%)
                    </p>
                    <p className="text-xl font-black text-primary">
                      ₹{currentBooking.advanceAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      To Pay at Salon (80%)
                    </p>
                    <p className="text-xl font-black text-slate-700">
                      ₹
                      {(currentBooking.payableAmount - currentBooking.advanceAmount).toLocaleString(
                        'en-IN',
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed">
                  <span className="text-muted-foreground italic">Payment Status</span>
                  <Badge
                    variant="outline"
                    className="font-bold uppercase tracking-tight text-[10px]"
                  >
                    {currentBooking.paymentStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Booking Notes if any */}
            {currentBooking.notes && (
              <Card className="bg-yellow-50/50 border-yellow-100">
                <CardContent className="p-4">
                  <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-1">
                    Customer Notes
                  </p>
                  <p className="text-sm text-slate-600">"{currentBooking.notes}"</p>
                </CardContent>
              </Card>
            )}

            {/* Pay Remaining Balance */}
            {currentBooking.status === BookingStatus.COMPLETED &&
              currentBooking.paymentStatus === PaymentStatus.ADVANCE_PAID && (
                <Card className="border-primary/10 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-primary">
                      <Icon icon="solar:wallet-money-bold-duotone" className="size-5" />
                      Pay Remaining Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-medium">
                        Final Balance (80%)
                      </span>
                      <span className="text-2xl font-black text-primary">
                        ₹
                        {(
                          currentBooking.payableAmount - currentBooking.advanceAmount
                        ).toLocaleString('en-IN')}
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
                        `Complete Payment · ₹${(currentBooking.payableAmount - currentBooking.advanceAmount).toLocaleString('en-IN')}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

            {/* Actions */}
            <div className="flex gap-3">
              {currentBooking.status === BookingStatus.COMPLETED && (
                <Button
                  variant="default"
                  className="flex-1 gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <Icon icon="solar:star-bold" className="size-4" />
                  Rate & Review
                </Button>
              )}
              {currentBooking.status === BookingStatus.CONFIRMED &&
                checkLeadTime(currentBooking.date, currentBooking.startTime) && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-blue-600 hover:bg-blue-50 border-blue-100"
                      onClick={handleReschedule}
                      disabled={
                        (currentBooking.rescheduleCount ?? 0) >= BOOKING_RULES.MAX_RESCHEDULES
                      }
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
                  </>
                )}
            </div>

            <ReviewModal
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
              bookingId={currentBooking.id}
              onSuccess={() => dispatch(fetchBookingDetails(currentBooking.id))}
            />
          </>
        )}
      </LoadingGate>
    </div>
  );
}
