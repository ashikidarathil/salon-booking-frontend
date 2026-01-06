'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

export default function StylistDashboard() {
  const todaysAppointments = [
    {
      time: '10:00 AM',
      customer: 'Sarah Johnson',
      service: 'Hair Cut + Color',
      amount: '$150',
      status: 'Confirmed',
    },
    {
      time: '12:30 PM',
      customer: 'Mike Chen',
      service: 'Beard Trim',
      amount: '$45',
      status: 'Confirmed',
    },
    {
      time: '02:00 PM',
      customer: 'Linda Park',
      service: 'Balayage',
      amount: '$280',
      status: 'Pending',
    },
    {
      time: '04:30 PM',
      customer: 'Alex Rivera',
      service: "Men's Cut",
      amount: '$60',
      status: 'Confirmed',
    },
  ];

  return (
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
                className="flex items-center justify-between p-6 transition-shadow border rounded-lg bg-card hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                    <span className="text-xl font-bold text-muted-foreground">
                      {appt.customer
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      {appt.customer}
                      {appt.status === 'Pending' && <Badge variant="secondary">Pending</Badge>}
                      {appt.status === 'Confirmed' && <Badge>Confirmed</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appt.service} • {appt.amount}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{appt.time}</p>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      Complete
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
