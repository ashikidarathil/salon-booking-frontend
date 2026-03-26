'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingGate } from '@/components/common/LoadingGate';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@iconify/react';
import { fetchStylistStats } from '@/features/booking/booking.thunks';
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
} from 'recharts';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const PERIODS = [
  { label: 'Today', value: 'today', icon: 'solar:calendar-date-bold-duotone' },
  { label: 'Week', value: 'week', icon: 'solar:calendar-minimalistic-bold-duotone' },
  { label: 'Month', value: 'month', icon: 'solar:calendar-bold-duotone' },
  { label: 'Year', value: 'year', icon: 'solar:calendar-line-duotone' },
];

export default function StylistDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, loading, error } = useAppSelector((state) => state.booking);
  const [period, setPeriod] = useState<string>('today');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const loadStats = useCallback(() => {
    dispatch(
      fetchStylistStats({
        period: period === 'custom' ? 'today' : period,
        date: period === 'custom' ? selectedDate?.toISOString().split('T')[0] : undefined,
      }),
    );
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
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-base text-muted-foreground font-normal">
            Real-time performance metrics and booking analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-muted/40 p-1 rounded-xl border border-border/30 inline-flex items-center">
            <Tabs
              value={period !== 'custom' ? period : ''}
              onValueChange={setPeriod}
              className="w-full"
            >
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
                {period === 'custom' && selectedDate
                  ? format(selectedDate, 'PPP')
                  : 'Specific Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className="rounded-xl theme-stylist"
              />
              <div className="p-3 border-t border-border/40 bg-muted/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-medium h-8 rounded-lg hover:bg-white hover:text-primary transition-colors"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setPeriod('today');
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
        emptyMessage="No data available for the selected period."
        resetError={loadStats}
        role="STYLIST"
        backPath="/stylist"
      >
        {stats && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ">
              <AnalyticsCard
                title="Total Revenue"
                value={`₹${stats.summary.revenue.toLocaleString()}`}
                subtitle="Earned revenue"
                icon="solar:wad-of-money-line-duotone"
                color="text-emerald-600"
                bg="bg-emerald-50/50"
              />
              <AnalyticsCard
                title="Total Bookings"
                value={stats.summary.total.toString()}
                subtitle="Appointments received"
                icon="solar:calendar-mark-line-duotone"
                color="text-blue-600"
                bg="bg-blue-50/50"
              />
              <AnalyticsCard
                title="Completed"
                value={stats.summary.completed.toString()}
                subtitle="Successfully served"
                icon="solar:check-circle-line-duotone"
                color="text-indigo-600"
                bg="bg-indigo-50/50"
              />
              <AnalyticsCard
                title="Cancellations"
                value={stats.summary.cancelled.toString()}
                subtitle="Missed opportunities"
                icon="solar:close-circle-line-duotone"
                color="text-rose-600"
                bg="bg-rose-50/50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Chart */}
              <Card className="lg:col-span-2 overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-gray-50/30 flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Icon
                        icon="solar:chart-square-bold-duotone"
                        className="text-primary size-5"
                      />
                      Performance Trend
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-normal mt-0.5">
                      {period === 'today' ? 'Hourly' : period === 'year' ? 'Monthly' : 'Daily'}{' '}
                      activity
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={stats.chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 400 }}
                          dy={10}
                          tickFormatter={(val: string) => {
                            if (!val) return '';
                            if (period === 'month' || period === 'week') {
                              try {
                                const date = new Date(val);
                                if (isNaN(date.getTime())) return val;
                                return format(date, 'MMM dd');
                              } catch {
                                return val;
                              }
                            }
                            return val;
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 400 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
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
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col items-center justify-center">
                  <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={stats.statusBreakdown.filter((s: { value: number }) => s.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {stats.statusBreakdown.map((entry: { color: string }, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-gray-900">
                        {stats.summary.total}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">Total</span>
                    </div>
                  </div>

                  <div className="w-full mt-4 space-y-2">
                    {stats.statusBreakdown.map(
                      (status: { name: string; value: number; color: string }) => (
                        <div
                          key={status.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50/30 border border-gray-100/50"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: status.color }}
                            />
                            <span className="text-xs font-medium text-gray-600">{status.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-900">
                              {status.value}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              (
                              {stats.summary.total > 0
                                ? Math.round((status.value / stats.summary.total) * 100)
                                : 0}
                              %)
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Manage Appointments CTA */}
            <div className="flex flex-col md:flex-row gap-6">
              <Card
                className="flex-1 border-primary/10 bg-primary/0 hover:bg-primary/5 transition-all cursor-pointer group rounded-xl pt-5"
                onClick={() => navigate('/stylist/appointments')}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                      <Icon icon="solar:calendar-search-line-duotone" className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Manage Appointments</h3>
                      <p className="text-xs text-muted-foreground font-normal">
                        View and manage all your bookings
                      </p>
                    </div>
                  </div>
                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className="size-5 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all"
                  />
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
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-xl pt-5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <h3 className={`text-2xl font-semibold mt-1 ${color}`}>{value}</h3>
            <p className="text-[10px] text-muted-foreground font-normal mt-0.5">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon icon={icon} className={`size-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
