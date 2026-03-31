import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchStylistBookings, updateBookingStatus } from '@/features/booking/booking.thunks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { LoadingGate } from '@/components/common/LoadingGate';
import { format } from 'date-fns';
import Pagination from '@/components/pagination/Pagination';
import { showSuccess, showApiError } from '@/common/utils/swal.utils';
import { BookingStatus, BOOKING_MESSAGES } from '@/features/booking/booking.constants';
import { fetchStylistRooms, initializeChatRoom } from '@/features/chat/chat.thunks';
import type { ChatRoom } from '@/features/chat/chat.types';
import { useDebounce } from '@/hooks/useDebounce';
import type { RootState } from '@/app/store';

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
    case BookingStatus.SPECIAL:
      return 'bg-primary/20 text-primary border-primary/30';
    case BookingStatus.FAILED:
      return 'bg-red-50 text-red-500 border-red-100';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function StylistAppointmentsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myBookings: bookingsList, pagination, loading, error } = useAppSelector((s) => s.booking);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterMode, setFilterMode] = useState<'today' | 'all'>('today');
  const [customDate, setCustomDate] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const limit = 5;

  const { rooms } = useAppSelector((state: RootState) => state.chat);

  useEffect(() => {
    dispatch(fetchStylistRooms());
  }, [dispatch]);

  const fetchBookings = useCallback(() => {
    let dateToFetch;
    if (filterMode === 'today') {
      dateToFetch = new Date().toISOString().split('T')[0];
    } else if (customDate) {
      dateToFetch = customDate;
    }

    dispatch(
      fetchStylistBookings({
        page,
        limit,
        search: debouncedSearch || undefined,
        date: dateToFetch,
      }),
    );
  }, [dispatch, page, limit, debouncedSearch, filterMode, customDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus, label: string) => {
    const result = await dispatch(updateBookingStatus({ bookingId, status }));
    if (updateBookingStatus.fulfilled.match(result)) {
      showSuccess('Updated!', BOOKING_MESSAGES.STATUS_UPDATE_SUCCESS);
      fetchBookings();
    } else {
      showApiError(BOOKING_MESSAGES.STATUS_UPDATE_FAILED, `Failed to mark ${label}`);
    }
  };

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
      navigate(`/stylist/chat?roomId=${room.id}`);
    } else {
      showApiError('Chat room not ready yet.', 'Please try again later.');
    }
  };

  useEffect(() => {
    const shouldOpenChat = searchParams.get('openChat') === 'true';
    if (shouldOpenChat) {
      const firstValidBooking = bookingsList.find(
        (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED,
      );

      if (firstValidBooking) {
        const room = rooms.find((r: ChatRoom) => r.bookingId === firstValidBooking.id);

        const openWidget = (r: { id: string }) => {
          navigate(`/stylist/chat?roomId=${r.id}`);
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
  }, [searchParams, rooms, bookingsList, dispatch, setSearchParams, navigate]);

  return (
    <div className="p-6 space-y-6 rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Appointments</h1>
          <p className="text-muted-foreground">Manage your appointment schedule</p>
        </div>
        <Button onClick={fetchBookings} variant="outline" className="gap-2">
          <Icon icon="solar:refresh-linear" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 w-full">
        <div className="flex gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto">
          <Button
            variant={filterMode === 'today' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setFilterMode('today');
              setCustomDate('');
              setPage(1);
            }}
            className={`flex-1 sm:flex-none ${filterMode === 'today' ? 'bg-background shadow-sm' : ''}`}
          >
            Today
          </Button>
          <Button
            variant={filterMode === 'all' && !customDate ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setFilterMode('all');
              setCustomDate('');
              setPage(1);
            }}
            className={`flex-1 sm:flex-none ${filterMode === 'all' && !customDate ? 'bg-background shadow-sm' : ''}`}
          >
            All Appointments
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <Input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              if (e.target.value) setFilterMode('all');
              setPage(1);
            }}
            className="w-full sm:w-40 text-sm"
          />
          <div className="relative w-full sm:w-64">
            <Icon
              icon="solar:search-linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full text-sm"
            />
          </div>
        </div>
      </div>

      <LoadingGate
        loading={loading}
        error={error}
        data={bookingsList}
        emptyMessage={`No appointments found.`}
        emptyIcon="solar:calendar-minimalistic-broken"
        resetError={fetchBookings}
        backPath="/stylist"
        role="STYLIST"
      >
        <div className="grid gap-4">
          {bookingsList.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden transition-all hover:shadow-md border-border/60"
            >
              <div className="flex flex-col md:flex-row">
                <div className="p-4 sm:p-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded border text-muted-foreground w-fit">
                          #{booking.bookingNumber}
                        </span>
                        <Badge className={`sm:hidden ${getStatusColor(booking.status)}`}>
                          {booking.status === BookingStatus.SPECIAL ? 'Special' : booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-start sm:items-center gap-2">
                        <Icon icon="solar:calendar-bold-duotone" className="size-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
                        <span className="font-semibold leading-tight text-sm sm:text-base">
                          {booking.date
                            ? format(new Date(booking.date), 'EEEE, MMMM do, yyyy')
                            : 'Date not set'}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status === BookingStatus.SPECIAL ? 'Special' : booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon icon="solar:scissors-square-bold-duotone" className="size-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {booking.items.map((i) => i.serviceName).filter(Boolean).join(' + ') || 'Appointment'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon icon="solar:user-bold-duotone" className="size-3" />
                            <span>{booking.userName || 'Customer'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-1 w-full sm:w-auto mt-1 sm:mt-0 px-1 sm:px-0">
                        <span className="text-xs text-muted-foreground font-normal">
                          {format(new Date(booking.date), 'dd MMM')} · {booking.startTime} - {booking.endTime}
                        </span>
                        <span className="font-bold">₹{booking.totalPrice?.toLocaleString('en-IN') ?? '0'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/40">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                          Booking Status
                        </p>
                        <Badge variant="outline" className={`mt-1 text-[10px] h-5 ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                          Total Amount
                        </p>
                        <p className="text-xl font-bold text-primary">₹{booking.totalPrice?.toLocaleString('en-IN') ?? '0'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 sm:px-6 sm:py-4 md:w-64 border-t md:border-t-0 md:border-l border-border/40 flex flex-col justify-center gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-10"
                    onClick={() => navigate(`/stylist/appointments/${booking.id}`)}
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
                      Chat with Customer
                    </Button>
                  )}

                  {booking.status === BookingStatus.CONFIRMED && (
                    <>
                      <Button
                        className="w-full justify-start gap-2 h-10 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                        onClick={() =>
                          handleStatusUpdate(booking.id, BookingStatus.COMPLETED, 'Completed')
                        }
                      >
                        <Icon icon="solar:check-circle-bold-duotone" className="size-4" />
                        Mark as Completed
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                        onClick={() =>
                          handleStatusUpdate(booking.id, BookingStatus.NO_SHOW, 'No Show')
                        }
                      >
                        <Icon icon="solar:ghost-bold-duotone" className="size-4" />
                        Mark as No Show
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between pt-6 mt-4 border-t md:flex-row">
            <p className="mb-4 text-sm text-center text-muted-foreground md:mb-0">
              Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} entries
            </p>
            <div className="-mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        )}
      </LoadingGate>
    </div>
  );
}
