import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBookingDetails, updateBookingStatus } from '@/features/booking/booking.thunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { showApiError, showSuccess, showCancellationConfirm } from '@/common/utils/swal.utils';
import { BookingStatus, BOOKING_MESSAGES } from '@/features/booking/booking.constants';
import { LoadingGate } from '@/components/common/LoadingGate';

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

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBooking, loading, error } = useAppSelector((state) => state.booking);

  useEffect(() => {
    if (id) dispatch(fetchBookingDetails(id));
  }, [id, dispatch]);

  const handleStatusUpdate = async (status: BookingStatus, label: string) => {
    if (!currentBooking) return;
    const result = await dispatch(updateBookingStatus({ bookingId: currentBooking.id, status }));
    if (updateBookingStatus.fulfilled.match(result)) {
      showSuccess('Updated!', `Booking marked as ${label}`);
    } else {
      showApiError(BOOKING_MESSAGES.STATUS_UPDATE_FAILED, `Failed to update status`);
    }
  };

  const handleCancel = async () => {
    if (!currentBooking) return;
    const reason = await showCancellationConfirm();
    if (reason) {
      const result = await dispatch(
        updateBookingStatus({ bookingId: currentBooking.id, status: BookingStatus.CANCELLED }),
      );
      if (updateBookingStatus.fulfilled.match(result))
        showSuccess('Cancelled!', BOOKING_MESSAGES.CANCEL_SUCCESS);
    }
  };

  if (!currentBooking && !loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon icon="solar:calendar-minimalistic-broken" className="size-16 opacity-40" />
        <p className="text-lg font-medium text-muted-foreground">Booking not found</p>
        <Button onClick={() => navigate('/admin/bookings')} variant="outline">
          Back to All Bookings
        </Button>
      </div>
    );
  }

  const b = currentBooking;

  return (
    <LoadingGate
      loading={loading}
      error={error}
      data={currentBooking}
      resetError={() => id && dispatch(fetchBookingDetails(id))}
      backPath="/admin/bookings"
    >
      <div className="p-6 mx-auto space-y-6 max-w-8xl rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md text-foreground">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <Icon icon="solar:arrow-left-linear" className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">Manage Booking</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>#{b?.bookingNumber}</span>
              <span>·</span>
              <span>Customer: {b?.userName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Badge className={getStatusColor(b?.status as BookingStatus)}>
              {b?.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Main Details */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Icon icon="solar:clipboard-list-bold-duotone" className="size-5 text-primary" />
                  Appointment Info
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                    Date
                  </p>
                  <p className="font-bold text-sm">{b?.date ? format(new Date(b.date), 'PPP') : ''}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                    Time Window
                  </p>
                  <p className="font-bold text-sm">
                    {b?.startTime} - {b?.endTime}
                  </p>
                </div>
                <div className="col-span-2 pt-4 border-t">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-3">
                    Financial Breakdown
                  </p>
                  <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Amount</span>
                      <span className="font-semibold">₹{b?.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    {(b?.discountAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-red-600 text-sm">
                        <span>Discount</span>
                        <span className="font-semibold">
                          - ₹{b?.discountAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black border-t pt-2 border-border/60">
                      <span>Net Amount</span>
                      <span className="text-primary">₹{b?.payableAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold italic text-muted-foreground pt-1">
                      <span>Advance Collected (20%)</span>
                      <span>₹{b?.advanceAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Icon icon="solar:scissors-square-bold-duotone" className="size-5 text-primary" />
                  Services & Stylists
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {b?.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium">{item.serviceName || 'Service'}</p>
                      <p className="text-xs text-muted-foreground">Stylist: {item.stylistName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.startTime} - {item.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">{item.duration} min</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {b?.status === BookingStatus.CONFIRMED && (
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleStatusUpdate(BookingStatus.COMPLETED, 'Completed')}
                  >
                    <Icon icon="solar:check-circle-linear" className="mr-2" /> Mark Completed
                  </Button>
                )}
                {b?.status === BookingStatus.CONFIRMED && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full text-gray-600"
                      onClick={() => handleStatusUpdate(BookingStatus.NO_SHOW, 'No Show')}
                    >
                      <Icon icon="solar:ghost-linear" className="mr-2" /> Mark No Show
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:bg-red-50"
                      onClick={handleCancel}
                    >
                      <Icon icon="solar:close-circle-linear" className="mr-2" /> Cancel Booking
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Meta Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge variant="outline">{b?.paymentStatus}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rescheduled</span>
                  <span>{b?.rescheduleCount || 0} times</span>
                </div>
                {b?.cancelledAt && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground">CANCELLED DETAILS</p>
                    <p className="mt-1 text-xs text-red-600">By: {b.cancelledBy}</p>
                    <p className="pb-1 mt-1 text-xs italic text-muted-foreground">
                      "{b.cancelledReason}"
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(b.cancelledAt), 'Pp')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LoadingGate>
  );
}
