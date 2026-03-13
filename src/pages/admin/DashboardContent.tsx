'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingGate } from '@/components/common/LoadingGate';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@iconify/react';
import { fetchAdminDashboardStats } from '@/features/admin/state/admin.thunks';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PERIODS = [
  { label: 'Today', value: 'today', icon: 'solar:calendar-date-bold-duotone' },
  { label: 'Week', value: 'week', icon: 'solar:calendar-minimalistic-bold-duotone' },
  { label: 'Month', value: 'month', icon: 'solar:calendar-bold-duotone' },
  { label: 'Year', value: 'year', icon: 'solar:calendar-line-duotone' },
];

export default function DashboardContent() {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.admin);
  const [period, setPeriod] = useState<string>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const loadStats = useCallback(() => {
    dispatch(fetchAdminDashboardStats({ 
      period: (period === 'custom' ? 'today' : period) as any, 
      endDate: period === 'custom' ? selectedDate?.toISOString() : undefined 
    }));
  }, [dispatch, period, selectedDate]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setPeriod('custom');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold font-heading tracking-tight text-gray-900">
            Platform Overview
          </h1>
          <p className="mt-1 text-base text-muted-foreground font-normal">
            Comprehensive business metrics and platform performance analytics
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-muted/40 p-1 rounded-xl border border-border/30 inline-flex items-center">
            <Tabs value={period !== 'custom' ? period : ''} onValueChange={setPeriod} className="w-full">
              <TabsList className="bg-transparent h-9 gap-1">
                {PERIODS.map((p) => (
                  <TabsTrigger 
                    key={p.value} 
                    value={p.value}
                    className="rounded-lg px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all text-sm"
                  >
                    <Icon icon={p.icon} className="mr-2 size-4" />
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={`rounded-xl h-[40px] px-4 font-medium border-border/30 bg-muted/40 hover:bg-white transition-all shadow-sm text-sm ${period === 'custom' ? 'border-primary text-primary bg-white' : ''}`}
              >
                <Icon icon="solar:calendar-add-bold-duotone" className="mr-2 size-4" />
                {period === 'custom' && selectedDate ? format(selectedDate, 'PPP') : 'Specific Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className="rounded-xl theme-admin"
              />
              <div className="p-3 border-t border-border/40 bg-muted/10">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs font-medium h-8 rounded-lg hover:bg-white hover:text-primary transition-colors"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setPeriod('month');
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <LoadingGate
        loading={loading && !stats}
        error={error}
        data={stats}
        emptyMessage="No dashboard data available for the selected period."
        resetError={loadStats}
        role="ADMIN"
      >
        {stats && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 ">
              <AnalyticsCard 
                title="Total Revenue" 
                value={`₹${stats.summary.totalRevenue.toLocaleString()}`}
                subtitle="For selected period"
                icon="solar:wad-of-money-bold-duotone"
                color="text-emerald-600"
                bg="bg-emerald-50/50"
              />
              <AnalyticsCard 
                title="Bookings" 
                value={stats.summary.totalBookings.toString()}
                subtitle="In selected period"
                icon="solar:calendar-mark-bold-duotone"
                color="text-blue-600"
                bg="bg-blue-50/50"
              />
              <AnalyticsCard 
                title="Customers" 
                value={stats.summary.totalCustomers.toString()}
                subtitle="Active users"
                icon="solar:users-group-rounded-bold-duotone"
                color="text-indigo-600"
                bg="bg-indigo-50/50"
              />
              <AnalyticsCard 
                title="Active Stylists" 
                value={stats.summary.activeStylists.toString()}
                subtitle="Onboarded professionals"
                icon="solar:user-speak-bold-duotone"
                color="text-purple-600"
                bg="bg-purple-50/50"
              />
              <AnalyticsCard 
                title="Escrow Balance" 
                value={`₹${stats.summary.pendingEscrow.toLocaleString()}`}
                subtitle="Pending release"
                icon="solar:shield-check-bold-duotone"
                color="text-orange-600"
                bg="bg-orange-50/50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Chart */}
              <Card className="lg:col-span-2 overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-gray-50/30 flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Icon icon="solar:chart-square-bold-duotone" className="text-primary size-5" />
                      Platform Revenue Trend
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-normal mt-0.5">
                      {period === 'today' ? 'Hourly' : period === 'year' ? 'Monthly' : 'Daily'} performance
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stats.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 400 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 400 }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                          name="Revenue"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="bookings" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorBookings)" 
                          name="Bookings"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Breakdown Pie Chart */}
              <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-gray-50/30 py-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Icon icon="solar:pie-chart-bold-duotone" className="text-primary size-5" />
                    Booking Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col items-center justify-center">
                  <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={stats.bookingStatusBreakdown.filter((s: any) => s.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {stats.bookingStatusBreakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-gray-900">{stats.summary.totalBookings}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Total</span>
                    </div>
                  </div>
                  
                  <div className="w-full mt-4 space-y-2">
                    {stats.bookingStatusBreakdown.map((status: any) => (
                      <div key={status.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/30 border border-gray-100/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                          <span className="text-xs font-medium text-gray-600">{status.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-semibold text-gray-900">{status.value}</span>
                           <span className="text-[10px] text-muted-foreground font-normal">({stats.summary.totalBookings > 0 ? Math.round((status.value / stats.summary.totalBookings) * 100) : 0}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* User Growth Chart */}
               <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-gray-50/30 py-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-primary size-5" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                   <div className="min-h-[250px] w-full">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stats.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                          <Bar dataKey="customers" fill="#6366f1" radius={[4, 4, 0, 0]} name="Customers" />
                          <Bar dataKey="stylists" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Stylists" />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </CardContent>
              </Card>

              {/* Top Stylists List */}
              <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-gray-50/30 py-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Icon icon="solar:medal-star-bold-duotone" className="text-primary size-5" />
                    Top Performing Stylists
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border/40">
                        <TableHead className="w-[200px] text-xs font-semibold py-3">Stylist</TableHead>
                        <TableHead className="text-xs font-semibold text-center py-3">Bookings</TableHead>
                        <TableHead className="text-xs font-semibold text-right py-3">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topStylists.map((stylist) => (
                        <TableRow key={stylist.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8 border-2 border-primary/10">
                                <AvatarImage src={stylist.avatar || ''} />
                                <AvatarFallback className="bg-primary/5 text-primary text-[10px] uppercase">
                                  {stylist.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{stylist.name}</p>
                                {/* <div className="flex items-center gap-1">
                                   <Icon icon="solar:star-bold" className="text-amber-400 size-3" />
                                   <span className="text-[10px] font-medium text-muted-foreground">{stylist.rating}</span>
                                </div> */}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-4">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2 py-0.5 text-[10px] font-bold">
                              {stylist.bookings}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-4 font-bold text-gray-900 text-sm">
                            ₹{stylist.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </LoadingGate>
    </div>
  );
}

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  bg: string;
}

function AnalyticsCard({ title, value, subtitle, icon, color, bg }: AnalyticsCardProps) {
  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-xl pt-5 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className={`text-2xl font-bold mt-1.5 ${color}`}>{value}</h3>
            <p className="text-[10px] text-muted-foreground font-normal mt-1">{subtitle}</p>
          </div>
          <div className={`p-4 rounded-2xl ${bg} flex items-center justify-center`}>
            <Icon icon={icon} className={`size-7 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
