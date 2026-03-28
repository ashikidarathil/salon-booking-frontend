import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchReviews,
  deleteReviewThunk,
  restoreReviewThunk,
} from '@/features/review/state/review.thunks';
import type { ReviewPaginationParams } from '@/features/review/review.types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Star,
  MessageSquare,
  User,
  Trash2,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  RotateCcw,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { showConfirm, showSuccess, showApiError } from '@/common/utils/swal.utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useDebounce } from '@/hooks/useDebounce';

type DateRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';

export default function AdminReviewsPage() {
  const dispatch = useAppDispatch();
  const { reviews, total, isLoading } = useAppSelector((state) => state.review);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [dateRange, setDateRange] = useState<DateRangeType>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(1);
  const limit = 10;

  const getFetchParams = useCallback(() => {
    const params: ReviewPaginationParams = {
      page,
      limit,
      search: search.trim() || undefined,
      includeDeleted: true,
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
        start = startOfDay(now); // Fallback
      }

      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    }

    return params;
  }, [page, debouncedSearch, dateRange, selectedDate]);

  const loadReviews = useCallback(() => {
    dispatch(fetchReviews(getFetchParams()));
  }, [dispatch, getFetchParams]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setDateRange('custom');
      setPage(1);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await showConfirm(
      'Delete Review?',
      'Are you sure you want to soft-delete this review? It will be hidden from public view.',
      'Yes, Delete',
      'Cancel',
      '#ef4444',
    );

    if (confirm) {
      try {
        await dispatch(deleteReviewThunk(id)).unwrap();
        showSuccess('Deleted!', 'Review has been soft-deleted.');
      } catch (error) {
        showApiError(error, 'Failed to delete review');
      }
    }
  };

  const handleRestore = async (id: string) => {
    const confirm = await showConfirm(
      'Restore Review?',
      'Are you sure you want to restore this review? It will be visible to everyone again.',
      'Yes, Restore',
      'Cancel',
      '#10b981',
    );

    if (confirm) {
      try {
        await dispatch(restoreReviewThunk(id)).unwrap();
        showSuccess('Restored!', 'Review has been restored successfully.');
      } catch (error) {
        showApiError(error, 'Failed to restore review');
      }
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review Management</h1>
          <p className="text-muted-foreground text-sm">
            Monitor and manage all customer feedback across the salon.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center px-4 py-1.5 border rounded-full">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Admin Access</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10"
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

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto opacity-10 mb-4" />
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
            {reviews.map((review) => (
              <Card key={review.id} className="border-border/60 shadow-none">
                <CardContent className="p-6 mt-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={review.userId?.profilePicture} />
                        <AvatarFallback>
                          <User className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-base">
                            {review.userId?.name || 'Anonymous User'}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-4 text-sm text-gray-600 border-l-2 border-muted pl-4">
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {review.isDeleted ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-red-100 text-red-600 border border-red-200">
                            Deleted
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
                            onClick={() => handleRestore(review.id)}
                            title="Restore Review"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDelete(review.id)}
                          title="Delete Review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-6">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                  reviews
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-8 text-xs font-normal"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 text-xs font-normal"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
