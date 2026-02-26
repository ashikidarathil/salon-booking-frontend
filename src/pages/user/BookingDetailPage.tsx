import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBookingDetails, cancelBooking } from '@/features/booking/booking.thunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { format, differenceInHours } from 'date-fns';
import { showApiError, showSuccess, showCancellationConfirm } from '@/common/utils/swal.utils';
import {
  BookingStatus,
  BOOKING_MESSAGES,
  BOOKING_RULES,
} from '@/features/booking/booking.constants';

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return 'bg-green-100 text-green-700 border-green-200';
    case BookingStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case BookingStatus.PENDING:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case BookingStatus.CANCELLED:
      return 'bg-red-100 text-red-700 border-red-200';
    case BookingStatus.COMPLETED:
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case BookingStatus.NO_SHOW:
      return 'bg-gray-200 text-gray-600 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const StatusIcon: Record<string, string> = {
  CONFIRMED: 'solar:check-circle-bold-duotone',
  IN_PROGRESS: 'solar:play-circle-bold-duotone',
  PENDING: 'solar:clock-circle-bold-duotone',
  CANCELLED: 'solar:close-circle-bold-duotone',
  COMPLETED: 'solar:verified-check-bold-duotone',
  NO_SHOW: 'solar:ghost-bold-duotone',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBooking, loading } = useAppSelector((state) => state.booking);

  useEffect(() => {
    if (id) dispatch(fetchBookingDetails(id));
  }, [id, dispatch]);

  const checkLeadTime = (bookingDate: string, startTime: string) => {
    try {
      const dt = new Date(bookingDate);
      const [h, m] = startTime.split(':').map(Number);
      dt.setHours(h, m, 0, 0);
      return differenceInHours(dt, new Date()) >= BOOKING_RULES.LEAD_TIME_HOURS;
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
    // Navigate back to bookings page — the rescheduling dialog is in BookingsPage
    navigate('/profile/bookings');
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
    <div className="max-w-6xl mx-auto p-6 space-y-6 ">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <Icon icon="solar:arrow-left-linear" className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-heading">Booking Details</h1>
          <p className="text-muted-foreground text-sm">#{b.id.slice(-8).toUpperCase()}</p>
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

      {/* Summary */}
      <Card>
        <CardContent className="p-5 mt-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge variant="outline" className="text-xs">
                {b.paymentStatus}
              </Badge>
            </div>
            {b.notes && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Notes</span>
                <span className="text-right max-w-[60%]">{b.notes}</span>
              </div>
            )}
            {b.extensionReason && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Extended</span>
                <span className="text-right max-w-[60%] text-xs">{b.extensionReason}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary text-lg">₹{b.totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
