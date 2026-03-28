import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchDailyOverrides,
  createDailyOverride,
  deleteDailyOverride,
} from '@/features/schedule/schedule.thunks';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  startOfToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { showSuccess, showError, showLoading, showConfirm } from '@/common/utils/swal.utils';
import StylistBranchService from '@/services/stylistBranch.service';
import type { Shift } from '@/features/schedule/schedule.types';

import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';

interface DailyAdjustmentsProps {
  stylistId?: string;
  branchId?: string;
}

export default function DailyAdjustments({
  stylistId: propStylistId,
  branchId: propBranchId,
}: DailyAdjustmentsProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { dailyOverrides } = useAppSelector((state) => state.schedule);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([{ startTime: '09:00', endTime: '18:00' }]);
  const [reason, setReason] = useState('');
  const [fetchedBranchId, setFetchedBranchId] = useState<string | null>(null);

  const effectiveStylistId = propStylistId || user?.id;
  const effectiveBranchId = propBranchId || user?.branchId || fetchedBranchId;

  useEffect(() => {
    const fetchStylistBranch = async () => {
      if (!propBranchId && !user?.branchId && effectiveStylistId && user?.role === 'STYLIST') {
        try {
          const response = await StylistBranchService.getStylistBranches(effectiveStylistId);
          const branches = response.data.data;
          if (branches.length > 0) {
            const activeBranch = branches.find((b: BranchStylist) => b.mappingId);
            const branchId = activeBranch?.branchId || branches[0].branchId;
            setFetchedBranchId(branchId);
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

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleDateClick = (date: Date) => {
    if (isBefore(date, startOfToday())) return;

    const override = dailyOverrides.find((o) => isSameDay(new Date(o.date), date));

    setSelectedDate(date);
    if (override) {
      setIsWorkingDay(override.isWorkingDay);
      setShifts(
        override.shifts.length > 0 ? override.shifts : [{ startTime: '09:00', endTime: '18:00' }],
      );
      setReason(override.reason || '');
    } else {
      setIsWorkingDay(true);
      setShifts([{ startTime: '09:00', endTime: '18:00' }]);
      setReason('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDate || !effectiveStylistId || !effectiveBranchId) return;

    showLoading('Saving adjustments...');
    try {
      await dispatch(
        createDailyOverride({
          stylistId: effectiveStylistId,
          branchId: effectiveBranchId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          isWorkingDay,
          shifts: isWorkingDay ? shifts : [],
          reason,
        }),
      ).unwrap();

      showSuccess('Success', 'Daily schedule adjusted');
      setIsDialogOpen(false);
    } catch (error: unknown) {
      showError('Error', (error as string) || 'Failed to save adjustment');
    }
  };

  const handleDelete = async (overrideId: string) => {
    const confirmed = await showConfirm(
      'Remove adjustment?',
      'This will revert the schedule to your standard weekly routine for this day.',
      'Yes, remove',
    );

    if (confirmed && effectiveStylistId && effectiveBranchId) {
      showLoading('Removing adjustment...');
      try {
        await dispatch(deleteDailyOverride(overrideId)).unwrap();
        showSuccess('Success', 'Adjustment removed');
        setIsDialogOpen(false);
      } catch (error: unknown) {
        showError('Error', (error as string) || 'Failed to remove adjustment');
      }
    }
  };

  const handleTimeChange = (index: number, field: keyof Shift, value: string) => {
    const newShifts = [...shifts];
    newShifts[index] = { ...newShifts[index], [field]: value };
    setShifts(newShifts);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-6 border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                Daily Adjustments
              </CardTitle>
              <CardDescription className="text-sm">
                Override your standard routine for specific dates.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="h-9 w-9 rounded-xl hover:bg-slate-50 text-slate-600"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="size-5" />
              </Button>
              <span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="h-9 w-9 rounded-xl hover:bg-slate-50 text-slate-600"
              >
                <Icon icon="solar:alt-arrow-right-linear" className="size-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-7 gap-3 sm:gap-4 p-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] py-2"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square opacity-0" />
        ))}
        {days.map((date) => {
          const override = dailyOverrides.find((o) => isSameDay(new Date(o.date), date));
          const past = isBefore(date, startOfToday());
          const isTodayDate = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={past}
              className={cn(
                'min-h-[70px] rounded-xl p-1.5 transition-all group flex flex-col items-center justify-center gap-0.5 border',
                past
                  ? 'opacity-30 cursor-not-allowed bg-muted/20 border-transparent'
                  : 'hover:bg-accent/50',
                isTodayDate ? 'border-primary/50 bg-primary/5' : 'bg-background border-border',
                override &&
                  (override.isWorkingDay
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-destructive/30 bg-destructive/5'),
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isTodayDate ? 'text-primary' : past ? 'text-muted-foreground' : 'text-foreground',
                  override && !override.isWorkingDay && 'text-destructive',
                )}
              >
                {format(date, 'd')}
              </span>

              {override && (
                <div className="flex flex-col items-center gap-0.5 mt-1">
                  <Badge
                    variant={override.isWorkingDay ? 'secondary' : 'destructive'}
                    className="px-1.5 h-3.5 text-[7px] font-bold uppercase tracking-tight"
                  >
                    {override.isWorkingDay ? 'Shift' : 'Off'}
                  </Badge>
                  {override.isWorkingDay && override.shifts[0] && (
                    <span className="text-[7px] font-medium text-muted-foreground leading-none">
                      {override.shifts[0].startTime}
                    </span>
                  )}
                </div>
              )}

              {isTodayDate && !override && (
                <div className="absolute top-1 right-1 size-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="theme-stylist w-[calc(100%-2rem)] sm:max-w-[420px] rounded-xl gap-0 p-0 border shadow-lg flex flex-col max-h-[95dvh] overflow-hidden">
          <DialogHeader className="p-6 border-b text-left">
            <DialogTitle className="text-xl font-bold text-foreground">Adjust Schedule</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Working Day</Label>
                <p className="text-xs text-muted-foreground">Available for bookings on this date</p>
              </div>
              <Switch checked={isWorkingDay} onCheckedChange={setIsWorkingDay} />
            </div>

            {isWorkingDay && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col gap-4">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Shift Hours
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        value={shifts[0]?.startTime}
                        onChange={(e) => handleTimeChange(0, 'startTime', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                        End Time
                      </Label>
                      <Input
                        type="time"
                        value={shifts[0]?.endTime}
                        onChange={(e) => handleTimeChange(0, 'endTime', e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Reason (Optional)
              </Label>
              <Input
                placeholder="Holiday, Extra Shift etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <DialogFooter className="p-6 border-t gap-3">
            {selectedDate &&
              dailyOverrides.find((o) => isSameDay(new Date(o.date), selectedDate)) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const o = dailyOverrides.find((o) =>
                      isSameDay(new Date(o.date), selectedDate!),
                    );
                    if (o) handleDelete(o.id);
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/5"
                >
                  <Icon icon="solar:trash-bin-trash-linear" className="size-5" />
                </Button>
              )}
            <Button onClick={handleSave} className="flex-1">
              Update Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
