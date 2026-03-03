'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingGate } from '@/components/common/LoadingGate';
import { fetchStylistBookings, fetchStylistTodayBookings } from '@/features/booking/booking.thunks';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/pagination/Pagination';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function StylistDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myBookings, todayBookings, pagination, loading, error } = useAppSelector((state) => state.booking);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchBookings = useCallback(() => {
    dispatch(
      fetchStylistBookings({
        page,
        limit,
        search: debouncedSearch || undefined,
        date: new Date().toISOString().split('T')[0],
      })
    );
  }, [dispatch, page, limit, debouncedSearch]);

  useEffect(() => {
    dispatch(fetchStylistTodayBookings());
  }, [dispatch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const stats = {
    today: todayBookings.length,
    pending: todayBookings.filter((b) => b.status === 'PENDING').length,
    confirmed: todayBookings.filter((b) => b.status === 'CONFIRMED').length,
    cancelled: todayBookings.filter((b) => b.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading">Stylist Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage your upcoming and recent bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.today}</p>
            <p className="text-xs text-muted-foreground mt-1">Overall appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-xs text-muted-foreground mt-1">Ready to serve</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-red-600">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-muted-foreground mt-1">Cancellations</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold">Today's Appointments</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
            <Button variant="outline" size="sm" onClick={fetchBookings} className="shrink-0">
              <Icon icon="solar:restart-bold" className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LoadingGate
            loading={loading}
            error={error}
            data={myBookings}
            emptyMessage="No appointments found."
            resetError={() => dispatch(fetchStylistBookings({}))}
            role="STYLIST"
            backPath="/stylist"
          >
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row items-center justify-between p-5 border rounded-xl bg-card hover:shadow-md transition-all gap-4 border-border/60"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                      <Icon icon="solar:user-bold-duotone" className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-lg">
                          Booking #{booking.id.slice(-6).toUpperCase()}
                        </span>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                      <div className="text-sm font-medium mt-1">
                        {booking.userName || 'Unknown Customer'}
                      </div>
                      {booking.status === 'CANCELLED' && (
                        <div className="text-sm font-medium mt-1 text-red-600 italic">
                          Reason: {booking.cancelledReason || 'No reason provided'}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:calendar-linear" className="size-4" />
                          <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:clock-circle-linear" className="size-4" />
                          <span>
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    <div className="flex flex-col items-end mr-4">
                      <p className="text-xs text-muted-foreground font-medium uppercase">
                        Total Amount
                      </p>
                      <p className="font-bold text-primary">₹{booking.totalPrice}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate(`/stylist/appointments/${booking.id}`)}
                    >
                      <Icon icon="solar:document-text-linear" className="size-4" />
                      Details
                    </Button>
                  </div>
                </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
