import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchReviews,
  fetchStylistRating,
} from '@/features/review/state/review.thunks';
import type { ReviewPaginationParams } from '@/features/review/review.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, Search, X } from 'lucide-react';
import Pagination from '@/components/pagination/Pagination';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';

type DateRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';

export default function StylistReviewsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { reviews, total, stats, isLoading } = useAppSelector((state) => state.review);

  const [initialLoading, setInitialLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeType>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(1);
  const limit = 5;

  const getFetchParams = useCallback(() => {
    const params: ReviewPaginationParams = {
      stylistId: user?.id,
      page,
      limit,
      search: search.trim() || undefined,
    };

    if (dateRange !== 'all') {
      const now = new Date();
      let start: Date;
      let end: Date = endOfDay(now);

      if (dateRange === 'today') start = startOfDay(now);
      else if (dateRange === 'week') start = startOfDay(subDays(now, 7));
      else if (dateRange === 'month') start = startOfDay(subDays(now, 30));
      else if (dateRange === 'custom' && selectedDate) {
        start = startOfDay(selectedDate);
        end = endOfDay(selectedDate);
      } else {
        start = startOfDay(now);
      }

      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    }

    return params;
  }, [user?.id, page, search, dateRange, selectedDate]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchStylistRating(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!user?.id) return;
      await dispatch(fetchReviews(getFetchParams()));
      setInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, user?.id, getFetchParams]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setDateRange('custom');
      setPage(1);
    }
  };

  if (initialLoading && isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* Stats Summary */}
        <Card className="flex-1 shadow-none border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              Rating Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-semibold">{stats.averageRating.toFixed(1)}</span>
              <span className="text-lg text-muted-foreground">/ 5.0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">From {stats.totalReviews} reviews</p>
          </CardContent>
        </Card>

        {/* Filters Card */}
        <Card className="flex-[2] shadow-none border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground">
              Filter Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 h-10 border-border/60"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md border h-10">
                  {(['all', 'today', 'week', 'month'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={dateRange === range ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setDateRange(range);
                        setPage(1);
                      }}
                      className="capitalize h-8 px-3 text-xs font-normal"
                    >
                      {range}
                    </Button>
                  ))}
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={dateRange === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className={`h-10 px-4 text-xs font-normal gap-2 ${dateRange === 'custom' ? '' : 'bg-muted/30 border-border/60'}`}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange === 'custom' && selectedDate
                        ? format(selectedDate, 'MMM d, yyyy')
                        : 'Go to Day'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      className="theme-stylist"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {isLoading && reviews.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : reviews.length === 0 ? (
          <Card className="p-16 text-center text-muted-foreground border-dashed">
            <MessageSquare className="h-10 w-10 mx-auto opacity-10 mb-4" />
            <p className="text-sm">No reviews found matching your criteria.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearch('');
                setDateRange('all');
              }}
              className="mt-2 text-xs"
            >
              Clear all filters
            </Button>
          </Card>
        ) : (
          <>
            <div className={`space-y-4 ${isLoading ? 'opacity-50' : ''}`}>
              {reviews.map((review) => (
                <Card key={review.id} className="shadow-none border-border/60">
                  <CardContent className="p-6 mt-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={review.userId?.profilePicture} />
                          <AvatarFallback className="text-muted-foreground">
                            {review.userId?.name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-base">
                            {review.userId?.name || 'Anonymous Client'}
                          </h4>
                          <div className="flex items-center gap-3 mt-0.5">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal px-2 py-0 border-muted"
                      >
                        Verified
                      </Badge>
                    </div>

                    {review.comment && (
                      <p className="mt-4 text-sm text-gray-600 border-l-2 border-muted pl-4">
                        "{review.comment}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="pt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
