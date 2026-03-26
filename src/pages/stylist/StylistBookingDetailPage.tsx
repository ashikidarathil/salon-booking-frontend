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
    case BookingStatus.COMPLETED:
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case BookingStatus.CANCELLED:
      return 'bg-red-100 text-red-700 border-red-200';
    case BookingStatus.NO_SHOW:
      return 'bg-gray-200 text-gray-600 border-gray-300';
    case BookingStatus.FAILED:
      return 'bg-red-50 text-red-500 border-red-100';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function StylistBookingDetailPage() {
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
      showSuccess('Updated!', `Appointment marked as ${label}`);
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
        <p className="text-lg font-medium text-muted-foreground">Appointment not found</p>
        <Button onClick={() => navigate('/stylist/appointments')} variant="outline">
          Back to Appointments
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
      backPath="/stylist/appointments"
      role="STYLIST"
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md text-foreground">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <Icon icon="solar:arrow-left-linear" className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">Appointment Details</h1>
            <p className="text-muted-foreground text-sm">#{b?.bookingNumber}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Badge className={getStatusColor(b?.status as BookingStatus)}>{b?.status.replace('_', ' ')}</Badge>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Info Card */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  Date
                </p>
                <p className="font-bold text-lg">
                  {b?.date ? format(new Date(b.date), 'PPPP') : ''}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  Time Window
                </p>
                <p className="font-bold text-lg">
                  {b?.startTime} - {b?.endTime}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Icon icon="solar:scissors-square-bold-duotone" className="size-5 text-primary" />
                Services requested
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="space-y-3">
                {b?.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {item.serviceName || 'Service'}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">
                        {item.duration} minutes · {item.startTime} - {item.endTime}
                      </p>
                    </div>
                    <Badge variant="outline" className="h-6 px-2 font-bold bg-background">
                      ₹{item.price}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-dashed space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{b?.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                {(b?.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold text-red-500 uppercase tracking-widest">
                    <span>Discount</span>
                    <span>- ₹{b?.discountAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Net Total
                  </span>
                  <span className="text-primary font-black text-2xl">
                    ₹{b?.payableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/70 italic">
                  <span>Advance Received (20%)</span>
                  <span>₹{b?.advanceAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {b?.notes && (
            <Card className="bg-yellow-50/30 border-yellow-100">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-yellow-700 uppercase mb-1">
                  Customer Note
                </p>
                <p className="text-sm">"{b?.notes}"</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {b?.status === BookingStatus.CONFIRMED && (
              <>
                <Button
                  className="w-full h-12 text-base font-bold bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handleStatusUpdate(BookingStatus.COMPLETED, 'Completed')}
                >
                  <Icon icon="solar:check-circle-bold-duotone" className="mr-2 size-5" />
                  Mark as Completed
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-10 text-gray-600"
                    onClick={() => handleStatusUpdate(BookingStatus.NO_SHOW, 'No Show')}
                  >
                    <Icon icon="solar:ghost-bold-duotone" className="mr-2 size-4" />
                    No Show
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 text-red-600 hover:bg-red-50"
                    onClick={handleCancel}
                  >
                    <Icon icon="solar:close-circle-bold-duotone" className="mr-2 size-4" />
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </LoadingGate>
  );
}
