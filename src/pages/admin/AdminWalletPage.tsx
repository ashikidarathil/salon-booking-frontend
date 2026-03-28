import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAdminEscrows } from '@/features/escrow/escrow.thunks';
import { EscrowStatus } from '@/features/escrow/escrow.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DollarSign,
  Lock,
  Calendar as CalendarIcon,
  CheckCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfDay, endOfDay, subDays, startOfYear } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { Icon } from '@iconify/react';
import { useDebounce } from '@/hooks/useDebounce';

const PERIODS = [
  { label: 'All', value: 'all', icon: 'solar:globus-bold-duotone' },
  { label: 'Today', value: 'today', icon: 'solar:calendar-date-bold-duotone' },
  { label: 'Week', value: 'week', icon: 'solar:calendar-minimalistic-bold-duotone' },
  { label: 'Month', value: 'month', icon: 'solar:calendar-bold-duotone' },
  { label: 'Year', value: 'year', icon: 'solar:calendar-line-duotone' },
];

export default function AdminWalletPage() {
  const dispatch = useAppDispatch();
  const { escrows, pagination, loading } = useAppSelector((s) => s.escrow);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('escrowed');
  const [period, setPeriod] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getDateRange = (period: string, customDate?: Date) => {
    let start: Date | undefined;
    let end: Date | undefined = endOfDay(new Date());

    if (period === 'all') {
      return { startDate: undefined, endDate: undefined };
    }

    if (period === 'custom' && customDate) {
      start = startOfDay(customDate);
      end = endOfDay(customDate);
    } else if (period === 'today') {
      start = startOfDay(new Date());
    } else if (period === 'week') {
      start = startOfDay(subDays(new Date(), 6));
    } else if (period === 'month') {
      start = startOfDay(subDays(new Date(), 29));
    } else if (period === 'year') {
      start = startOfDay(startOfYear(new Date()));
    }

    return {
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    };
  };

  const loadEscrows = useCallback(() => {
    const { startDate, endDate } = getDateRange(period, selectedDate);
    dispatch(
      fetchAdminEscrows({
        page,
        limit: 10,
        search: debouncedSearchTerm,
        status: activeTab === 'escrowed' ? EscrowStatus.HELD : EscrowStatus.RELEASED,
        startDate,
        endDate,
      }),
    );
  }, [dispatch, page, debouncedSearchTerm, activeTab, period, selectedDate]);

  useEffect(() => {
    loadEscrows();
  }, [loadEscrows]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setPage(1);
  };

  const handleRefresh = () => {
    loadEscrows();
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setPeriod('custom');
      setPage(1);
    }
  };

  // Note: Since we are using pagination, these totals are ONLY for the current page if calculated here.
  const pageTotal = (escrows || []).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Financial Oversight</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor escrowed funds and daily releases
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

          <Button
            variant="outline"
            size="sm"
            className="h-[40px] rounded-xl gap-2 shadow-sm border-border/30 bg-muted/40"
            onClick={handleRefresh}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-lg bg-primary text-primary-foreground pt-5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                {activeTab === 'escrowed' ? (
                  <Lock className="size-5" />
                ) : (
                  <CheckCircle className="size-5" />
                )}
                <p className="text-sm font-medium">
                  {activeTab === 'escrowed' ? 'Page Escrow Total' : 'Page Release Total'}
                </p>
              </div>
              <p className="text-3xl font-bold text-white">₹{pageTotal.toLocaleString('en-IN')}</p>
              <p className="text-xs mt-1 opacity-70">Showing current page funds</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-lg bg-muted/60 pt-5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                <CalendarIcon className="size-5" />
                <p className="text-sm font-medium">Automatic Release</p>
              </div>
              <p className="text-3xl font-bold">Every 2 Minutes</p>
              <p className="text-xs mt-1 text-muted-foreground italic">
                Funds are processed automatically every 2 minutes.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-lg bg-muted/60 pt-5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                <DollarSign className="size-5" />
                <p className="text-sm font-medium">Search Records</p>
              </div>
              <div className="relative">
                <Input
                  placeholder="Booking #..."
                  className="h-9 pr-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-9 w-9 pointer-events-none"
                >
                  <Search className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Escrow Details */}
      <Card>
        <CardHeader className="pb-0 border-b-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Icon icon="solar:wad-of-money-bold-duotone" className="text-primary size-5" />
            Funds Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mx-6">
              <TabsTrigger value="escrowed">Escrowed Funds</TabsTrigger>
              <TabsTrigger value="released">Release History</TabsTrigger>
            </TabsList>

            <TabsContent value="escrowed" className="mt-4 border-t">
              {loading && escrows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground italic">
                  <RefreshCw className="size-8 mx-auto mb-3 animate-spin opacity-30" />
                  <p>Loading escrowed funds...</p>
                </div>
              ) : escrows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Lock className="size-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No funds currently in escrow matching your search</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {escrows.map((e) => (
                    <div
                      key={e.id}
                      className="p-6 flex items-start justify-between hover:bg-muted/10 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl text-primary font-heading">
                            ₹{e.amount.toLocaleString('en-IN')}
                          </span>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            #{e.bookingId?.bookingNumber || 'N/A'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="font-semibold">
                              {e.bookingId?.userId?.name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Stylist:</span>
                            <span className="font-semibold">
                              {e.stylistId?.userId?.name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs col-span-full">
                            <span className="text-muted-foreground">Service:</span>
                            <span className="font-medium">
                              {e.bookingId?.items
                                ?.map((i) => i?.serviceId?.name)
                                .filter(Boolean)
                                .join(', ') || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          {/* <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                            <Calendar className="size-3" />
                            Release: {e.releaseMonth}
                          </p> */}
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                            Created: {format(new Date(e.createdAt), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 uppercase tracking-widest text-[10px] px-3 py-1">
                        HELD
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="released" className="mt-4 border-t">
              {loading && escrows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground italic">
                  <RefreshCw className="size-8 mx-auto mb-3 animate-spin opacity-30" />
                  <p>Loading history...</p>
                </div>
              ) : escrows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <CheckCircle className="size-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No releases found matching your search</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {escrows.map((e) => (
                    <div
                      key={e.id}
                      className="p-6 flex items-start justify-between hover:bg-muted/10 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl text-green-600 font-heading">
                            ₹{e.amount.toLocaleString('en-IN')}
                          </span>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            #{e.bookingId?.bookingNumber || 'N/A'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="size-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-[10px]">
                              C
                            </div>
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="font-semibold">
                              {e.bookingId.userId?.name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="size-6 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-[10px]">
                              S
                            </div>
                            <span className="text-muted-foreground">Stylist:</span>
                            <span className="font-semibold">
                              {e.stylistId?.userId?.name || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle className="size-3" />
                          Released on {e.releaseDate}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 uppercase tracking-widest text-[10px] px-3 py-1"
                      >
                        RELEASED
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t bg-muted/10">
              <p className="text-xs text-muted-foreground font-medium">
                Showing page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex items-center gap-1 px-3"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex items-center gap-1 px-3"
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex gap-4 items-start shadow-sm">
        <div className="bg-blue-600 p-2 rounded-lg shrink-0">
          <Info className="size-5 text-white" />
        </div>
        <div className="text-sm text-blue-900">
          <p className="font-bold mb-1 font-heading uppercase tracking-tighter">Escrow Payout Strategy</p>
          <p className="opacity-80">Funds are held securely by the platform until the 1st of every month. On release day, our system automatically moves these funds to each stylist's available wallet balance. You can track all scheduled and past releases here.</p>
        </div>
      </div> */}
    </div>
  );
}
