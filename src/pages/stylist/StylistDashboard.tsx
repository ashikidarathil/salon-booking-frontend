'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingGate } from '@/components/common/LoadingGate';
import { BookingExtensionDialog } from '@/components/booking/BookingExtensionDialog';
import type { BookingItem } from '@/features/booking/booking.types';

export default function StylistDashboard() {
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  // Mock data adapted to BookingItem interface for the extension dialog to work
  const todaysAppointments = [
    {
      id: 'mock-1',
      branchId: '65cf12345678901234567890', // Dummy branchId
      stylistId: 'myself',
      time: '10:00 AM',
      customer: 'Sarah Johnson',
      service: 'Hair Cut + Color',
      serviceId: 's1',
      amount: '$150',
      status: 'Confirmed',
      startTime: '10:00',
      endTime: '11:00',
      date: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      branchId: '65cf12345678901234567890',
      stylistId: 'myself',
      time: '12:30 PM',
      customer: 'Mike Chen',
      service: 'Beard Trim',
      serviceId: 's2',
      amount: '$45',
      status: 'Confirmed',
      startTime: '12:30',
      endTime: '13:00',
      date: new Date().toISOString(),
    },
    {
      id: 'mock-3',
      branchId: '65cf12345678901234567890',
      stylistId: 'myself',
      time: '02:00 PM',
      customer: 'Linda Park',
      service: 'Balayage',
      serviceId: 's3',
      amount: '$280',
      status: 'Pending',
      startTime: '14:00',
      endTime: '16:00',
      date: new Date().toISOString(),
    },
  ];

  const handleOpenExtension = (appt: any) => {
    setSelectedBooking(appt as BookingItem);
    setIsExtensionOpen(true);
  };

  return (
    <LoadingGate loading={false} error={null} data={true}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your Appointments</h1>
          <p className="mt-2 text-muted-foreground">Manage your upcoming and recent bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">4 completed, 4 upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">18 confirmed, 6 pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Auto-matched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">From waitlist</p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cancellations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-sm text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysAppointments.map((appt, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 transition-shadow border rounded-lg bg-card hover:shadow-md gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                      <span className="text-xl font-bold text-muted-foreground">
                        {appt.customer
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center flex-wrap gap-2 font-medium">
                        <span className="truncate">{appt.customer}</span>
                        {appt.status === 'Pending' && <Badge variant="secondary">Pending</Badge>}
                        {appt.status === 'Confirmed' && <Badge>Confirmed</Badge>}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {appt.service} • {appt.amount}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                    <p className="font-medium whitespace-nowrap">{appt.time}</p>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                      >
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                      >
                        View
                      </Button>
                      {appt.status === 'Confirmed' && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                          onClick={() => handleOpenExtension(appt)}
                        >
                          Add Service / Extend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <BookingExtensionDialog
          isOpen={isExtensionOpen}
          onClose={() => setIsExtensionOpen(false)}
          booking={selectedBooking}
        />
      </div>
    </LoadingGate>
  );
}
