import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchMyBookings,
  cancelBooking,
  rescheduleBooking,
} from '@/features/booking/booking.thunks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { LoadingGate } from '@/components/common/LoadingGate';
import { format } from 'date-fns';
import { showApiError, showSuccess, showCancellationConfirm } from '@/common/utils/swal.utils';
import Swal from 'sweetalert2';
import { SlotBookingDialog } from '@/components/booking/SlotBookingDialog';
import { fetchUserRooms, initializeChatRoom } from '@/features/chat/chat.thunks';
import type { ChatRoom } from '@/features/chat/chat.types';
import type { RootState } from '@/app/store';
import type { BookingItem, BookingDetailsItem } from '@/features/booking/booking.types';
import {
  BookingStatus,
  PaymentStatus,
  BOOKING_MESSAGES,
  BOOKING_RULES,
} from '@/features/booking/booking.constants';
import { PaymentCountdown } from '@/components/common/PaymentCountdown';

export default function BookingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myBookings, loading, error } = useAppSelector((state) => state.booking);
  const { rooms } = useAppSelector((state: RootState) => state.chat);
  const [searchParams, setSearchParams] = useSearchParams();

  // State for rescheduling
  const [rescheduleData, setRescheduleData] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    branchId: string | null;
    services: BookingDetailsItem[];
    stylistId: string | null;
  }>({
    isOpen: false,
    bookingId: null,
    branchId: null,
    services: [],
    stylistId: null,
  });

  useEffect(() => {
    dispatch(fetchMyBookings());
    dispatch(fetchUserRooms());
  }, [dispatch]);

  const handleOpenChat = async (bookingId: string) => {
    let room = rooms.find((r: ChatRoom) => r.bookingId === bookingId);

    if (!room) {
      try {
        const action = await dispatch(initializeChatRoom(bookingId)).unwrap();
        room = action;
        showSuccess('Room Ready', 'Chat room initialized successfully.');
      } catch {
        showApiError('Chat room not ready yet.', 'Please try again later.');
        return;
      }
    }

    if (room && room.id) {
      navigate(`/profile/chat?roomId=${room.id}`);
    } else {
      showApiError('Chat room not ready yet.', 'Please try again later.');
    }
  };

  useEffect(() => {
    const shouldOpenChat = searchParams.get('openChat') === 'true';
    if (shouldOpenChat) {
      const firstValidBooking = myBookings.find(
        (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED,
      );

      if (firstValidBooking) {
        const room = rooms.find((r: ChatRoom) => r.bookingId === firstValidBooking.id);

        const openWidget = (r: { id: string }) => {
          navigate(`/profile/chat?roomId=${r.id}`);
        };

        if (room) {
          openWidget(room);
        } else {
          dispatch(initializeChatRoom(firstValidBooking.id))
            .unwrap()
            .then((newRoom) => openWidget(newRoom))
            .catch(() => setSearchParams({}));
        }
      } else {
        setSearchParams({});
      }
    }
  }, [searchParams, rooms, myBookings, dispatch, setSearchParams, navigate]);

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

  const checkLeadTime = (bookingDate: string, startTime: string) => {
    try {
      // 1. Parse booking date (e.g., "2026-02-28T00:00:00.000Z")
      const appointmentDate = new Date(bookingDate);
      const [hours, minutes] = startTime.split(':').map(Number);

      // 2. Set the appointment time (HH:mm)
      appointmentDate.setHours(hours, minutes, 0, 0);

      // 3. Current time
      const now = new Date();

      // 4. Calculate difference in hours
      const diffMs = appointmentDate.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      return diffHrs >= BOOKING_RULES.LEAD_TIME_HOURS;
    } catch {
      return false;
    }
  };

  const handleCancelClick = async (booking: BookingItem) => {
    if (!checkLeadTime(booking.date, booking.startTime)) {
      showApiError(BOOKING_MESSAGES.LEAD_TIME_ERROR, 'Cannot Cancel');
      return;
    }

    const reason = await showCancellationConfirm();
    if (reason) {
      const result = await dispatch(cancelBooking({ bookingId: booking.id, reason }));
      if (cancelBooking.fulfilled.match(result)) {
        showSuccess('Cancelled!', 'Your booking has been cancelled.');
      }
    }
  };

  const handleRescheduleClick = (booking: BookingItem) => {
    if (!checkLeadTime(booking.date, booking.startTime)) {
      showApiError(BOOKING_MESSAGES.LEAD_TIME_ERROR, 'Cannot Reschedule');
      return;
    }

    if (booking.rescheduleCount && booking.rescheduleCount >= BOOKING_RULES.MAX_RESCHEDULES) {
      showApiError(BOOKING_MESSAGES.RESCHEDULE_LIMIT_REACHED, 'Limit Reached');
      return;
    }

    setRescheduleData({
      isOpen: true,
      bookingId: booking.id,
      branchId: booking.branchId,
      services: booking.items,
      stylistId: booking.stylistId,
    });
  };

  const handleRescheduleSubmit = async (data: {
    stylistId: string;
    date: string;
    startTime: string;
    slotId: string;
  }) => {
    if (!rescheduleData.bookingId) return;

    const { value: reason } = await Swal.fire({
      title: 'Reschedule Reason',
      text: 'Why are you rescheduling this appointment?',
      input: 'text',
      inputPlaceholder: 'e.g. Change in plans, Emergency...',
      showCancelButton: true,
      confirmButtonText: 'Confirm Reschedule',
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage('Reason is required');
        }
        return value;
      },
    });

    if (reason) {
      // Calculate sequential timings for services
      let currentStartTime = data.startTime;
      const rescheduledItems = [];

      for (const service of rescheduleData.services) {
        rescheduledItems.push({
          serviceId: service.serviceId,
          stylistId: data.stylistId,
          date: data.date,
          startTime: currentStartTime,
          slotId: data.slotId, // Slot ID reflects the block
        });

        // Calculate next start time (15m increments)
        const [hrs, mins] = currentStartTime.split(':').map(Number);
        const totalMins = hrs * 60 + mins + (service.duration || 30);
        currentStartTime = `${Math.floor(totalMins / 60)
          .toString()
          .padStart(2, '0')}:${(totalMins % 60).toString().padStart(2, '0')}`;
      }

      const result = await dispatch(
        rescheduleBooking({
          bookingId: rescheduleData.bookingId,
          data: {
            reason,
            items: rescheduledItems,
          },
        }),
      );

      if (rescheduleBooking.fulfilled.match(result)) {
        showSuccess('Rescheduled!', BOOKING_MESSAGES.RESCHEDULE_SUCCESS);
        setRescheduleData((prev) => ({ ...prev, isOpen: false }));
      }
    }
  };

  return (
    <div className="space-y-6 p-8 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">My Bookings</h1>
          <p className="text-muted-foreground">Manage and track your salon appointments</p>
        </div>
      </div>

      <LoadingGate
        loading={loading}
        error={error}
        data={myBookings}
        emptyMessage="You don't have any bookings yet."
        emptyIcon="solar:calendar-minimalistic-broken"
      >
        <div className="grid gap-4">
          {myBookings.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden transition-all hover:shadow-md border-border/60"
            >
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded border text-muted-foreground">
                          #{booking.bookingNumber}
                        </span>
                        <Icon icon="solar:calendar-bold-duotone" className="size-5 text-primary" />
                        <span className="font-semibold">
                          {booking.date
                            ? format(new Date(booking.date), 'EEEE, MMMM do, yyyy')
                            : 'Date not set'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(booking.status as BookingStatus)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {booking.items && booking.items.length > 0 ? (
                      booking.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40 gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon
                                icon="solar:scissors-square-bold-duotone"
                                className="size-6 text-primary"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {item.serviceName || 'Professional Service'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Icon icon="solar:user-bold-duotone" className="size-3" />
                                <span>{item.stylistName || 'Expert Stylist'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-medium pr-2">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-muted-foreground font-normal">
                                {item.date ? format(new Date(item.date), 'dd MMM') : ''} ·{' '}
                                {item.startTime} – {item.endTime}
                              </span>
                              <span>₹{item.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon icon="solar:user-bold-duotone" className="size-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase">
                            Stylist
                          </p>
                          <p className="font-semibold text-sm">
                            {booking.stylistName || 'Professional Stylist'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                          Payment Status
                        </p>
                        <Badge variant="outline" className="mt-1 text-[10px] h-5">
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {booking.status === BookingStatus.PENDING_PAYMENT ? (
                          <>
                            <p className="text-xs text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                              Advance Due (20%)
                            </p>
                            <p className="text-xl font-bold text-primary">
                              ₹{booking.advanceAmount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              of ₹{booking.totalPrice.toLocaleString('en-IN')} total
                            </p>
                          </>
                        ) : booking.paymentStatus === PaymentStatus.ADVANCE_PAID ? (
                          <>
                            <p className="text-xs text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                              Advance Paid (20%)
                            </p>
                            <p className="text-xl font-bold text-green-600">
                              ₹{booking.advanceAmount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              of ₹{booking.totalPrice.toLocaleString('en-IN')} total
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                              Total Amount
                            </p>
                            <p className="text-xl font-bold text-primary">
                              ₹{booking.totalPrice.toLocaleString('en-IN')}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 px-6 py-4 md:w-64 border-t md:border-t-0 md:border-l border-border/40 flex flex-col justify-center gap-2">
                  {booking.status === BookingStatus.PENDING_PAYMENT && (
                    <>
                      {booking.paymentWindowExpiresAt && (
                        <PaymentCountdown expiresAt={booking.paymentWindowExpiresAt} />
                      )}
                      {booking.paymentWindowExpiresAt &&
                      new Date(booking.paymentWindowExpiresAt) > new Date() ? (
                        <Button
                          className="w-full justify-start gap-2 h-10 bg-primary hover:bg-primary/90 text-white"
                          onClick={() => navigate(`/checkout/${booking.id}`)}
                        >
                          <Icon icon="solar:card-2-bold" className="size-4" />
                          Pay Advance Now
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-1 items-center p-2 rounded-lg bg-red-50 border border-red-100 mb-2">
                          <span className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
                            Payment Expired
                          </span>
                          <span className="text-[10px] text-red-500 text-center">
                            Slot released
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {booking.status === BookingStatus.COMPLETED &&
                    booking.paymentStatus === PaymentStatus.ADVANCE_PAID && (
                      <Button
                        className="w-full justify-start gap-2 h-10 bg-primary hover:bg-primary/90 text-white shadow-sm"
                        onClick={() => navigate(`/profile/bookings/${booking.id}`)}
                      >
                        <Icon icon="solar:wallet-money-bold" className="size-4" />
                        Pay Remaining
                      </Button>
                    )}

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-10"
                    onClick={() => navigate(`/profile/bookings/${booking.id}`)}
                  >
                    <Icon icon="solar:document-text-linear" className="size-4" />
                    View Details
                  </Button>

                  {(booking.status === BookingStatus.CONFIRMED ||
                    booking.status === BookingStatus.COMPLETED) && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-10 text-primary hover:text-primary/90 hover:bg-primary/5 border-primary/10"
                      onClick={() => handleOpenChat(booking.id)}
                    >
                      <Icon icon="solar:chat-round-bold-duotone" className="size-4" />
                      Chat with Stylist
                    </Button>
                  )}

                  {booking.status === BookingStatus.CONFIRMED && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100"
                        onClick={() => handleRescheduleClick(booking)}
                        disabled={
                          booking.rescheduleCount
                            ? booking.rescheduleCount >= BOOKING_RULES.MAX_RESCHEDULES
                            : false
                        }
                      >
                        <Icon icon="solar:calendar-rotate-linear" className="size-4" />
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                        onClick={() => handleCancelClick(booking)}
                      >
                        <Icon icon="solar:close-circle-linear" className="size-4" />
                        Cancel Booking
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </LoadingGate>

      {rescheduleData.isOpen && rescheduleData.branchId && (
        <SlotBookingDialog
          isOpen={rescheduleData.isOpen}
          onClose={() => setRescheduleData((prev) => ({ ...prev, isOpen: false }))}
          branchId={rescheduleData.branchId}
          selectedServices={rescheduleData.services.map((s) => ({
            serviceId: s.serviceId,
            name: s.serviceName || 'Service',
            price: s.price,
            duration: s.duration,
          }))}
          initialStylistId={rescheduleData.stylistId || undefined}
          isCartMode={true}
          onSelect={handleRescheduleSubmit}
        />
      )}
    </div>
  );
}
