import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchStylistTodayBookings,
  fetchStylistBookings,
  updateBookingStatus,
} from '@/features/booking/booking.thunks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { LoadingGate } from '@/components/common/LoadingGate';
import { format } from 'date-fns';
import { showSuccess, showApiError } from '@/common/utils/swal.utils';
import { BookingStatus, BOOKING_MESSAGES } from '@/features/booking/booking.constants';
import type { BookingItem } from '@/features/booking/booking.types';

const getStatusColor = (status: string) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return 'bg-green-100 text-green-700 border-green-200';
    case BookingStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case BookingStatus.COMPLETED:
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case BookingStatus.CANCELLED:
      return 'bg-red-100 text-red-700 border-red-200';
    case BookingStatus.NO_SHOW:
      return 'bg-gray-200 text-gray-600 border-gray-300';
    case 'SPECIAL':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

type Tab = 'today' | 'upcoming' | 'past';

export default function StylistAppointmentsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { todayBookings, myBookings, loading, error } = useAppSelector((s) => s.booking);
  const [activeTab, setActiveTab] = useState<Tab>('today');

  useEffect(() => {
    dispatch(fetchStylistTodayBookings());
    dispatch(fetchStylistBookings({}));
  }, [dispatch]);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcomingBookings = myBookings.filter((b) => {
    const d = new Date(b.date);
    return (
      d >= today &&
      (b.status === BookingStatus.CONFIRMED ||
        b.status === BookingStatus.IN_PROGRESS ||
        (b.status as string) === 'SPECIAL')
    );
  });
  const pastBookings = myBookings.filter((b) => {
    const d = new Date(b.date);
    return (
      d < today ||
      b.status === BookingStatus.COMPLETED ||
      b.status === BookingStatus.CANCELLED ||
      b.status === BookingStatus.NO_SHOW
    );
  });

  const bookingsList: BookingItem[] =
    activeTab === 'today'
      ? todayBookings
      : activeTab === 'upcoming'
        ? upcomingBookings
        : pastBookings;

  const handleStatusUpdate = async (bookingId: string, status: string, label: string) => {
    const result = await dispatch(updateBookingStatus({ bookingId, status }));
    if (updateBookingStatus.fulfilled.match(result)) {
      showSuccess('Updated!', `${BOOKING_MESSAGES.STATUS_UPDATE_SUCCESS}`);
    } else {
      showApiError(BOOKING_MESSAGES.STATUS_UPDATE_FAILED, `Failed to mark ${label}`);
    }
  };

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'today', label: 'Today', icon: 'solar:sun-bold-duotone', count: todayBookings.length },
    {
      key: 'upcoming',
      label: 'Upcoming',
      icon: 'solar:calendar-bold-duotone',
      count: upcomingBookings.length,
    },
    { key: 'past', label: 'Past', icon: 'solar:history-bold-duotone' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading">Appointments</h1>
        <p className="text-muted-foreground">Manage your appointment schedule</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon icon={tab.icon} className="size-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <LoadingGate
        loading={loading}
        error={error}
        data={bookingsList}
        emptyMessage={`No ${activeTab} appointments.`}
        emptyIcon="solar:calendar-minimalistic-broken"
      >
        <div className="grid gap-4 ">
          {bookingsList.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden border-border/60 hover:shadow-md transition-all"
            >
              <CardContent className="p-6 mt-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
                  {/* Left: booking info */}
                  <div className="flex items-start gap-4">
                    {/* Time badge */}
                    <div className="size-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {booking.startTime.slice(0, 5)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(booking.date), 'dd MMM')}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">
                          {booking.items
                            .map((i) => i.serviceName)
                            .filter(Boolean)
                            .join(' + ') || 'Appointment'}
                        </p>
                        <Badge
                          className={`text-[10px] h-5 border ${getStatusColor(booking.status)}`}
                        >
                          {(booking.status as string) === 'SPECIAL'
                            ? '⚡ Special'
                            : booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Icon icon="solar:clock-circle-linear" className="size-3" />
                        {booking.startTime} – {booking.endTime}
                        <span className="mx-1">·</span>
                        <span className="font-medium text-foreground">
                          ₹{booking.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => navigate(`/stylist/appointments/${booking.id}`)}
                    >
                      <Icon icon="solar:document-text-linear" className="size-4" />
                      Details
                    </Button>

                    {booking.status === BookingStatus.CONFIRMED && (
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          handleStatusUpdate(booking.id, BookingStatus.IN_PROGRESS, 'In Progress')
                        }
                      >
                        <Icon icon="solar:play-circle-bold-duotone" className="size-4" />
                        Start
                      </Button>
                    )}

                    {booking.status === BookingStatus.IN_PROGRESS && (
                      <>
                        <Button
                          size="sm"
                          className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() =>
                            handleStatusUpdate(booking.id, BookingStatus.COMPLETED, 'Completed')
                          }
                        >
                          <Icon icon="solar:check-circle-bold-duotone" className="size-4" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs text-gray-600"
                          onClick={() =>
                            handleStatusUpdate(booking.id, BookingStatus.NO_SHOW, 'No Show')
                          }
                        >
                          <Icon icon="solar:ghost-bold-duotone" className="size-4" />
                          No Show
                        </Button>
                      </>
                    )}

                    {booking.status === BookingStatus.CONFIRMED && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs text-gray-600"
                        onClick={() =>
                          handleStatusUpdate(booking.id, BookingStatus.NO_SHOW, 'No Show')
                        }
                      >
                        <Icon icon="solar:ghost-bold-duotone" className="size-4" />
                        No Show
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </LoadingGate>
    </div>
  );
}
