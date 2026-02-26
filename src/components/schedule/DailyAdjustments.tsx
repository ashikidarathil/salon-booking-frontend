import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchDailyOverrides,
  createDailyOverride,
  deleteDailyOverride,
} from '@/features/schedule/schedule.thunks';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfDay } from 'date-fns';
import { Icon } from '@iconify/react';
import { showSuccess, showError, showConfirm, showLoading } from '@/common/utils/swal.utils';
import { slotService } from '@/services/slot.service';
import type { SlotItem } from '@/features/slot/slot.types';
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';
import { cn } from '@/lib/utils';
import { stylistBranchService } from '@/services/stylistBranch.service';

const parseUTCDate = (dateString: string) => {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

const isSameDaySafe = (date1: Date | string, date2: Date | string) => {
  const d1 = typeof date1 === 'string' ? parseUTCDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseUTCDate(date2) : date2;
  return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
};

export default function DailyAdjustments({
  stylistId: propStylistId,
  branchId: propBranchId,
}: {
  stylistId?: string;
  branchId?: string;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { dailyOverrides, loading } = useAppSelector((state) => state.schedule);

  const [fetchedBranchId, setFetchedBranchId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');

  // Day Preview State
  const [daySlots, setDaySlots] = useState<SlotItem[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const effectiveStylistId = propStylistId || user?.id;
  const effectiveBranchId = propBranchId || user?.branchId || fetchedBranchId;

  // Fetch branch if not provided (for stylists)
  useEffect(() => {
    const fetchStylistBranch = async () => {
      if (!propBranchId && !user?.branchId && effectiveStylistId && user?.role === 'STYLIST') {
        try {
          const response = await stylistBranchService.getStylistBranches(effectiveStylistId);
          const branches = response.data.data;
          if (branches.length > 0) {
            const activeBranch = branches.find((b: BranchStylist) => b.stylistStatus === 'ACTIVE');
            setFetchedBranchId(activeBranch?.branchId || branches[0].branchId);
          }
        } catch (error) {
          console.error('Failed to fetch stylist branch:', error);
        }
      }
    };
    fetchStylistBranch();
  }, [propBranchId, user?.branchId, effectiveStylistId, user?.role]);

  useEffect(() => {
    if (effectiveStylistId && effectiveBranchId) {
      dispatch(fetchDailyOverrides({ stylistId: effectiveStylistId, branchId: effectiveBranchId }));
    }
  }, [dispatch, effectiveStylistId, effectiveBranchId]);

  // Fetch slots (bookings) for the selected day to show impact
  useEffect(() => {
    const loadDayPreview = async () => {
      if (selectedDate && effectiveBranchId && effectiveStylistId) {
        setSlotsLoading(true);
        try {
          const res = await slotService.getStylistSlots({
            branchId: effectiveBranchId,
            date: format(selectedDate, 'yyyy-MM-dd'),
            stylistId: effectiveStylistId,
          });
          setDaySlots(res.data.data);
        } catch (err) {
          console.error('Failed to load day preview', err);
        } finally {
          setSlotsLoading(false);
        }
      }
    };
    loadDayPreview();
  }, [selectedDate, effectiveBranchId, effectiveStylistId]);

  const existingOverride = useMemo(() => {
    if (!selectedDate) return null;
    return dailyOverrides.find((o) => isSameDaySafe(o.date, selectedDate));
  }, [selectedDate, dailyOverrides]);

  useEffect(() => {
    if (existingOverride) {
      setIsWorkingDay(existingOverride.isWorkingDay);
      if (existingOverride.shifts.length > 0) {
        setStartTime(existingOverride.shifts[0].startTime);
        setEndTime(existingOverride.shifts[0].endTime);
      }
      setReason(existingOverride.reason || '');
    } else {
      setIsWorkingDay(true);
      setStartTime('09:00');
      setEndTime('18:00');
      setReason('');
    }
  }, [existingOverride]);

  const handleSave = async () => {
    if (!selectedDate) {
      showError('Error', 'Please select a date');
      return;
    }

    if (!effectiveStylistId || !effectiveBranchId) {
      showError('Error', 'Missing branch or stylist information');
      return;
    }

    showLoading('Saving adjustment...');
    try {
      await dispatch(
        createDailyOverride({
          stylistId: effectiveStylistId,
          branchId: effectiveBranchId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          isWorkingDay,
          shifts: isWorkingDay ? [{ startTime, endTime }] : [],
          reason,
        }),
      ).unwrap();
      showSuccess('Success', 'Adjustment saved');
      setSelectedDate(undefined); // Reset the form selection
      setReason('');
    } catch (error: unknown) {
      showError('Error', (error as string) || 'Failed to save adjustment');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      'Remove Adjustment?',
      'Are you sure you want to delete this schedule override?',
    );

    if (!confirmed) return;

    showLoading('Removing adjustment...');
    try {
      await dispatch(deleteDailyOverride(id)).unwrap();
      showSuccess('Success', 'Adjustment removed');
    } catch (error: unknown) {
      showError('Error', (error as string) || 'Failed to remove adjustment');
    }
  };

  // Custom component to render indicators on the calendar
  const modifiers = {
    hasOverride: dailyOverrides.map((o) => parseUTCDate(o.date)),
  };

  const modifiersStyles = {
    hasOverride: {
      fontWeight: 'bold',
      color: 'hsl(var(--primary))',
      textDecoration: 'underline',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section with Date Picker */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-6 bg-primary/5 border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-primary">
                <Icon icon="solar:calendar-date-bold" className="size-8" />
                Daily Adjustments
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Customize your schedule for specific dates and holidays.
              </CardDescription>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-16 px-8 rounded-2xl flex items-center gap-4 border-primary/20 hover:border-primary hover:bg-white transition-all shadow-sm"
                >
                  <div className="text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60 leading-none mb-1.5">
                      Selected Date
                    </p>
                    <p className="text-xl font-semibold leading-none text-slate-800">
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </p>
                  </div>
                  <Icon
                    icon="solar:alt-arrow-down-bold-duotone"
                    className="size-5 text-primary ml-2"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 rounded-3xl shadow-2xl border-none overflow-hidden"
                align="end"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="p-4 theme-stylist"
                  disabled={{ before: startOfDay(new Date()) }}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
      </Card>

      {/* Main Workspace: Form and Preview side-by-side */}
      {selectedDate ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form Card */}
          <Card className="lg:col-span-2 border-none shadow-lg overflow-hidden h-fit">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Icon icon="solar:pen-new-square-bold" className="text-primary" />
                    Adjust Schedule
                  </CardTitle>
                  <CardDescription className="font-medium text-xs">
                    {format(selectedDate, 'PPPP')}
                  </CardDescription>
                </div>
                {existingOverride && (
                  <Badge className="bg-indigo-500 hover:bg-indigo-600 font-semibold px-3">
                    EDITING
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-dashed hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-2xl shadow-sm',
                      isWorkingDay ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                    )}
                  >
                    <Icon
                      icon={isWorkingDay ? 'solar:walking-bold' : 'solar:sleeping-bold'}
                      className="size-6"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm uppercase tracking-tight">
                      {isWorkingDay ? 'Working Day' : 'Mark as Off-Day'}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {isWorkingDay ? 'Show booking slots' : 'Block the whole day'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isWorkingDay}
                  onCheckedChange={setIsWorkingDay}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              {isWorkingDay && (
                <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-400">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                      Start Time
                    </label>
                    <div className="relative">
                      <Icon
                        icon="solar:clock-circle-linear"
                        className="absolute left-3 top-3 size-4 text-muted-foreground"
                      />
                      <Input
                        type="time"
                        className="pl-9 h-11 rounded-2xl font-semibold border-muted focus:ring-primary/20 transition-all"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                      End Time
                    </label>
                    <div className="relative">
                      <Icon
                        icon="solar:clock-circle-linear"
                        className="absolute left-3 top-3 size-4 text-muted-foreground"
                      />
                      <Input
                        type="time"
                        className="pl-9 h-11 rounded-2xl font-semibold border-muted focus:ring-primary/20 transition-all"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  Reason for Adjustment
                </label>
                <Input
                  placeholder="e.g. Training, Early Closure"
                  className="h-11 rounded-2xl font-medium border-muted focus:ring-primary/20"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button
                  className="w-full h-14 rounded-2xl text-base font-semibold shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <Icon icon="eos-icons:loading" className="size-5 animate-spin mr-2" />
                  ) : (
                    <Icon
                      icon="solar:check-circle-bold"
                      className="size-6 mr-2 group-hover:scale-110 transition-transform"
                    />
                  )}
                  {existingOverride ? 'Update Schedule' : 'Apply Adjustment'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Day Preview Card */}
          <Card className="lg:col-span-3 border-none shadow-lg overflow-hidden flex flex-col">
            <CardHeader className="pb-4 bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Icon icon="solar:mask-h-bold" className="text-primary" />
                    Interactive Day Map
                  </CardTitle>
                  <CardDescription className="font-medium text-xs">
                    Live availability preview
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-100 rounded-lg">
                    <div className="size-2 bg-green-500 rounded-full" />
                    <span className="text-[9px] font-semibold uppercase text-green-700">
                      Booked
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <div className="size-2 bg-indigo-500 rounded-full" />
                    <span className="text-[9px] font-semibold uppercase text-indigo-700">
                      Break
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              {slotsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                  <div className="p-4 bg-primary/5 rounded-full animate-pulse border border-primary/10">
                    <Icon icon="solar:magic-stick-3-bold" className="size-10 text-primary/40" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary/40">
                    Calculating Grid...
                  </p>
                </div>
              ) : daySlots.find((s) => s.status === 'HOLIDAY') ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-red-50/50 rounded-[2.5rem] border border-red-100 border-dashed m-4">
                  <div className="p-5 bg-red-100 rounded-full shadow-inner">
                    <Icon
                      icon="solar:calendar-minimalistic-broken"
                      className="size-12 text-red-600"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 text-xl uppercase tracking-tight">
                      Salon Holiday
                    </h3>
                    <p className="text-sm text-red-600/70 font-medium max-w-[240px] mx-auto mt-1">
                      {daySlots.find((s) => s.status === 'HOLIDAY')?.note ||
                        'This day is marked as a holiday. No slots are available.'}
                    </p>
                  </div>
                </div>
              ) : !isWorkingDay ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-red-50/50 rounded-[2.5rem] border border-red-100 border-dashed m-4">
                  <div className="p-5 bg-red-100 rounded-full shadow-inner">
                    <Icon icon="solar:ghost-bold" className="size-12 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 text-xl uppercase tracking-tight">
                      Day Blocked
                    </h3>
                    <p className="text-sm text-red-600/70 font-medium max-w-[240px] mx-auto mt-1">
                      Customers cannot book any slots on this date.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-[460px] overflow-y-auto pr-3 custom-scrollbar p-1">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={cn(
                          'relative p-3 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 group',
                          slot.status === 'BOOKED'
                            ? 'bg-green-100 border-green-200 text-green-800 shadow-sm'
                            : slot.status === 'BLOCKED'
                              ? 'bg-red-50 border-red-100 text-red-700 opacity-60'
                              : slot.status === 'BREAK'
                                ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                                : slot.status === 'OFF_DAY'
                                  ? 'bg-purple-100 border-purple-200 text-purple-800'
                                  : slot.status === 'HOLIDAY'
                                    ? 'bg-red-100 border-red-200 text-red-800'
                                    : slot.status === 'NON_WORKING'
                                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-40 shrink-0'
                                      : 'bg-muted/30 border-transparent text-muted-foreground/60 shadow-sm',
                        )}
                      >
                        <p className="text-[7px] font-semibold uppercase tracking-widest opacity-40 mb-1 group-hover:opacity-100 transition-opacity">
                          {slot.status}
                        </p>
                        <p className="text-xs font-semibold tracking-tight">{slot.startTime}</p>
                        {slot.status === 'BOOKED' && (
                          <div className="absolute -top-1.5 -right-1.5 flex transition-transform group-hover:scale-125">
                            <Icon
                              icon="solar:check-circle-bold"
                              className="size-5 text-green-600 bg-white rounded-full p-0.5 shadow-sm border border-green-200"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {daySlots.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-muted/20 rounded-[2.5rem] border border-dashed flex flex-col items-center">
                        <Icon
                          icon="solar:clock-circle-linear"
                          className="size-10 text-muted-foreground/30 mb-2"
                        />
                        <p className="font-medium text-muted-foreground/40 italic">
                          No slots for this time range.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-[2rem] border border-primary/10">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Icon icon="solar:info-square-bold" className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">
                        Live Dashboard Sync
                      </p>
                      <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                        This preview shows how your adjustment affects the customer booking grid.
                        <strong> Green blocks</strong> are your confirmed appointments.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] bg-card rounded-[3rem] border-2 border-dashed border-primary/10 shadow-inner group">
          <div className="p-8 bg-primary/5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
            <Icon icon="solar:calendar-search-bold-duotone" className="size-20 text-primary/30" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 uppercase tracking-tighter">
            Ready to adjust?
          </h3>
          <p className="font-medium text-muted-foreground/60 mt-1">
            Select a date from the picker above to begin.
          </p>
        </div>
      )}

      {/* Bottom Section: Active Overrides in long format */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-muted/20 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="solar:history-bold" className="size-5 text-primary" />
                Active Overrides
              </CardTitle>
              <CardDescription className="text-xs font-medium">
                All upcoming schedule adjustments you've applied.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="h-7 px-4 rounded-full border-primary/20 text-primary font-semibold uppercase tracking-widest text-[10px]"
            >
              {dailyOverrides.length} Applied
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {dailyOverrides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-30 text-center">
              <Icon icon="solar:calendar-minimalistic-linear" className="size-14 mb-4" />
              <p className="text-sm font-semibold uppercase tracking-widest">
                No active overrides found
              </p>
              <p className="text-xs font-medium mt-1">
                Your schedule is currently following your weekly routine.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dailyOverrides
                .filter((o) => startOfDay(parseUTCDate(o.date)) >= startOfDay(new Date()))
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((override) => (
                  <div
                    key={override.id}
                    onClick={() => setSelectedDate(parseUTCDate(override.date))}
                    className={cn(
                      'group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
                      selectedDate && isSameDaySafe(override.date, selectedDate)
                        ? 'bg-primary/5 border-primary shadow-md scale-[1.02]'
                        : 'bg-white border-slate-100 hover:border-primary/40 hover:shadow-sm',
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={cn(
                          'size-12 rounded-xl flex items-center justify-center shadow-sm transition-colors shrink-0',
                          override.isWorkingDay
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600',
                        )}
                      >
                        <Icon
                          icon={
                            override.isWorkingDay
                              ? 'solar:calendar-bold'
                              : 'solar:calendar-mark-bold'
                          }
                          className="size-6"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-800 tracking-tight leading-none mb-1.5 truncate">
                          {format(parseUTCDate(override.date), 'EEE, MMM d')}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={cn(
                              'h-5 text-[9px] font-semibold uppercase tracking-widest px-2.5 shrink-0',
                              override.isWorkingDay ? 'bg-green-500' : 'bg-red-500',
                            )}
                          >
                            {override.isWorkingDay ? 'SHIFT' : 'OFF'}
                          </Badge>
                          {override.isWorkingDay && (
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 rounded-md truncate">
                              {override.shifts[0]?.startTime}-{override.shifts[0]?.endTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-destructive hover:bg-destructive/5 h-10 w-10 rounded-xl shrink-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(override.id);
                      }}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="size-5" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
