'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Customers" value="1,248" change="+12%" icon="solar:user-bold" />
        <StatCard title="Active Stylists" value="24" change="+3" icon="solar:user-bold" />
        <StatCard title="Today's Bookings" value="68" change="+18%" icon="solar:calendar-bold" />
        <StatCard title="Revenue (Month)" value="$45,231" change="+8%" icon="solar:dollar-bold" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="w-full h-80">
            <LineChart
              data={[
                { month: 'Jan', revenue: 32000 },
                { month: 'Feb', revenue: 35000 },
                { month: 'Mar', revenue: 38000 },
                { month: 'Apr', revenue: 41000 },
                { month: 'May', revenue: 45000 },
                { month: 'Jun', revenue: 48000 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary)"
                strokeWidth={3}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Stylist</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Sarah Connor</TableCell>
                <TableCell>Emma Wilson</TableCell>
                <TableCell>Hair Coloring</TableCell>
                <TableCell>
                  <Badge className="text-green-700 bg-green-100">Confirmed</Badge>
                </TableCell>
                <TableCell className="text-right">$180</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change.startsWith('+');
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon icon={icon} className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}
