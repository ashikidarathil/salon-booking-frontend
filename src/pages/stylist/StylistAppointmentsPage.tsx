import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchStylistBookings, updateBookingStatus } from '@/features/booking/booking.thunks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { LoadingGate } from '@/components/common/LoadingGate';
import { format } from 'date-fns';
import Pagination from '@/components/pagination/Pagination';
import { showSuccess, showApiError } from '@/common/utils/swal.utils';
import { BookingStatus, BOOKING_MESSAGES } from '@/features/booking/booking.constants';
import { fetchStylistRooms, initializeChatRoom } from '@/features/chat/state/chat.thunks';

const getStatusColor = (status: string) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return 'bg-green-100 text-green-700 border-green-200';
    case BookingStatus.COMPLETED:
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case BookingStatus.CANCELLED:
      return 'bg-red-100 text-red-700 border-red-200';
    case BookingStatus.NO_SHOW:
      return 'bg-gray-200 text-gray-600 border-gray-300';
    case 'SPECIAL':
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const { rooms } = useAppSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchStylistRooms());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [filterMode, debouncedSearch, customDate]);

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

  const handleStatusUpdate = async (bookingId: string, status: string, label: string) => {
    const result = await dispatch(updateBookingStatus({ bookingId, status }));
    if (updateBookingStatus.fulfilled.match(result)) {
      showSuccess('Updated!', `${BOOKING_MESSAGES.STATUS_UPDATE_SUCCESS}`);
      fetchBookings();
    } else {
      showApiError(BOOKING_MESSAGES.STATUS_UPDATE_FAILED, `Failed to mark ${label}`);
    }
  };

  const handleOpenChat = async (booking: any) => {
    let room = rooms.find((r) => r.bookingId === booking.id);
    
    if (!room) {
      try {
        const action = await dispatch(initializeChatRoom(booking.id)).unwrap();
        room = action;
        showSuccess('Room Ready', 'Chat room initialized successfully.');
      } catch (err) {
        showApiError('Chat room not ready yet.', 'Please try again later.');
        return;
      }
    }
    
    navigate(`/stylist/chat?roomId=${room.id}`);
  };

  useEffect(() => {
    const shouldOpenChat = searchParams.get('openChat') === 'true';
    if (shouldOpenChat) {
      // Find the first confirmed/completed appointment and open chat
      const firstValidBooking = bookingsList.find(b => 
        b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED
      );
      
      if (firstValidBooking) {
        let room = rooms.find(r => r.bookingId === firstValidBooking.id);
        
        const openWidget = (r: any) => {
          navigate(`/stylist/chat?roomId=${r.id}`);
        };

        if (room) {
          openWidget(room);
        } else {
          // Room missing, initialize it
          dispatch(initializeChatRoom(firstValidBooking.id))
            .unwrap()
            .then(newRoom => openWidget(newRoom))
            .catch(() => setSearchParams({}));
        }
      } else {
        setSearchParams({});
      }
    }
  }, [searchParams, rooms, bookingsList, dispatch, setSearchParams, navigate]);

  return (
    <div className="p-6 space-y-6 rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Appointments</h1>
          <p className="text-muted-foreground">Manage your appointment schedule</p>
        </div>
        <Button onClick={fetchBookings} variant="outline" className="gap-2">
          <Icon icon="solar:refresh-linear" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-border pb-4 w-full">
        <div className="flex gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto">
          <Button
            variant={filterMode === 'today' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setFilterMode('today');
              setCustomDate('');
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
        <div className="grid gap-4 ">
          {bookingsList.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden transition-all border-border/60 hover:shadow-md"
            >
              <CardContent className="p-6 mt-5">
                <div className="flex flex-col justify-between gap-6 text-left sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center size-14 rounded-xl bg-primary/10 shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {booking.startTime.slice(0, 5)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(booking.date), 'dd MMM')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded border text-muted-foreground">
                          #{booking.bookingNumber}
                        </span>
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
                            ? 'Special'
                            : booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Icon icon="solar:user-rounded-linear" className="size-3" />
                        {booking.userName || 'Customer'}
                        <span className="mx-1">·</span>
                        <Icon icon="solar:clock-circle-linear" className="size-3" />
                        {booking.startTime} – {booking.endTime}
                        <span className="mx-1">·</span>
                        <span className="font-medium text-foreground">
                          ₹{booking.totalPrice?.toLocaleString('en-IN') ?? '0'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => navigate(`/stylist/appointments/${booking.id}`)}
                    >
                      <Icon icon="solar:document-text-linear" className="size-4" />
                      Details
                    </Button>

                    {(booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-primary hover:bg-primary/5"
                        onClick={() => handleOpenChat(booking)}
                      >
                        <Icon icon="solar:chat-round-bold-duotone" className="size-4" />
                        Chat
                      </Button>
                    )}

                    {booking.status === BookingStatus.CONFIRMED && (
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
                  </div>
                </div>
              </CardContent>
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
