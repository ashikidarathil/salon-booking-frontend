'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingGate } from '@/components/common/LoadingGate';
import { fetchStylistBookings } from '@/features/booking/booking.thunks';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';

export default function StylistDashboard() {
  const dispatch = useAppDispatch();
  const { myBookings, loading, error } = useAppSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchStylistBookings({}));
  }, [dispatch]);

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
    today: myBookings.length,
    pending: myBookings.filter((b) => b.status === 'PENDING').length,
    confirmed: myBookings.filter((b) => b.status === 'CONFIRMED').length,
    cancelled: myBookings.filter((b) => b.status === 'CANCELLED').length,
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Upcoming Appointments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => dispatch(fetchStylistBookings({}))}>
            <Icon icon="solar:restart-bold" className="mr-2 size-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <LoadingGate
            loading={loading}
            error={error}
            data={myBookings}
            emptyMessage="No appointments found."
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
                    <Button size="sm" variant="outline" className="gap-2">
                      <Icon icon="solar:document-text-linear" className="size-4" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </LoadingGate>
        </CardContent>
      </Card>
    </div>
  );
}
