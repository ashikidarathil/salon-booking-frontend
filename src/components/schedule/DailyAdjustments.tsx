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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
      <Card className="border-border/40 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="pb-6 bg-muted/30 border-b border-border/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2.5 text-foreground">
                <div className="size-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Icon icon="solar:calendar-date-bold-duotone" className="size-6 text-primary/80" />
                </div>
                Daily Overrides
              </CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground/50 mt-1 md:ml-12">
                Override your standard routine for specific dates like holidays.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-background p-1.5 rounded-2xl border border-border/20 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <Icon icon="solar:alt-arrow-left-bold-duotone" className="size-5" />
              </Button>
              <span className="text-sm font-bold text-foreground min-w-[120px] text-center uppercase tracking-wider">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <Icon icon="solar:alt-arrow-right-bold-duotone" className="size-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider mb-4"
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
                      'min-h-[64px] sm:min-h-[80px] rounded-xl sm:rounded-2xl p-1 sm:p-2 transition-all group flex flex-col items-center justify-between border overflow-hidden',
                      past
                        ? 'opacity-20 cursor-not-allowed bg-muted/10 border-transparent scale-95'
                        : 'hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-95',
                      isTodayDate ? 'border-primary bg-primary/[0.03]' : 'bg-background border-border/40',
                      override &&
                        (override.isWorkingDay
                          ? 'border-green-500/30 bg-green-500/[0.02]'
                          : 'border-destructive/30 bg-destructive/[0.02]'),
                    )}
                  >
                    <div className="w-full flex flex-col items-center justify-center gap-0.5 sm:gap-1">
                      <span
                        className={cn(
                          'text-[10px] sm:text-xs font-bold tracking-tight',
                          isTodayDate ? 'text-primary' : past ? 'text-muted-foreground' : 'text-foreground',
                          override && !override.isWorkingDay && 'text-destructive',
                        )}
                      >
                        {format(date, 'd')}
                      </span>
                      {isTodayDate && (
                         <span className="text-[6px] sm:text-[8px] font-bold uppercase tracking-tighter px-1 py-0.5 rounded bg-primary text-white leading-none">Today</span>
                      )}
                    </div>
  
                    {override ? (
                      <div className="w-full flex flex-col items-center sm:items-start gap-1">
                        <div className={cn(
                          "h-1 w-4 sm:h-1.5 sm:w-8 rounded-full mb-0.5 sm:mb-1",
                          override.isWorkingDay ? "bg-green-400" : "bg-destructive/60"
                        )} />
                        <span className={cn(
                          "text-[7px] sm:text-[9px] font-semibold truncate w-full text-center sm:text-left uppercase tracking-tighter opacity-70",
                          override.isWorkingDay ? "text-green-700" : "text-destructive"
                        )}>
                          {override.isWorkingDay ? (override.shifts[0]?.startTime || 'Shift') : 'Off'}
                        </span>
                      </div>
                    ) : (
                    <div className="h-5 w-full flex items-end">
                       {!past && <div className="h-1 w-4 rounded-full bg-border/20 group-hover:bg-primary/20 transition-colors" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl gap-0 p-0 border-none shadow-2xl overflow-hidden theme-stylist">
          <div className="bg-primary/5 p-8 border-b border-primary/10">
             <DialogHeader className="p-0 text-left">
                <DialogTitle className="text-2xl font-bold text-primary tracking-tight">Adjust Schedule</DialogTitle>
                <DialogDescription className="text-sm font-medium text-primary/40">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM do, yyyy') : ''}
                </DialogDescription>
              </DialogHeader>
          </div>

          <div className="p-8 space-y-8 bg-background">
            <div className="flex items-center justify-between p-5 rounded-2xl border border-border/40 bg-muted/10 transition-all hover:bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Working Day</Label>
                <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider leading-none">Available for bookings</p>
              </div>
              <Switch 
                 checked={isWorkingDay} 
                 onCheckedChange={setIsWorkingDay} 
                 className="data-[state=checked]:bg-green-500"
              />
            </div>

            {isWorkingDay && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-1">
                     <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Icon icon="solar:clock-circle-bold-duotone" className="size-4 text-primary/70" />
                     </div>
                     <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Shift Hours
                     </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl border border-border/20 bg-muted/5">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-wider pl-1">
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        value={shifts[0]?.startTime}
                        onChange={(e) => handleTimeChange(0, 'startTime', e.target.value)}
                        className="h-11 rounded-xl border-none bg-background shadow-inner font-semibold text-sm focus-visible:ring-primary/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-wider pl-1">
                        End Time
                      </Label>
                      <Input
                        type="time"
                        value={shifts[0]?.endTime}
                        onChange={(e) => handleTimeChange(0, 'endTime', e.target.value)}
                        className="h-11 rounded-xl border-none bg-background shadow-inner font-semibold text-sm focus-visible:ring-primary/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
               <div className="flex items-center gap-2 pl-1">
                 <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center">
                    <Icon icon="solar:notes-bold-duotone" className="size-4 text-primary/70" />
                 </div>
                 <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                   Reason (Optional)
                 </Label>
               </div>
               <Input
                placeholder="e.g. Holiday, Anniversary, Extra Shift"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-12 rounded-2xl border-border/40 bg-muted/5 px-4 font-medium text-sm focus-visible:ring-primary/10"
              />
            </div>
          </div>

          <div className="p-8 pt-4 flex gap-3 bg-background">
            {selectedDate &&
              dailyOverrides.find((o) => isSameDay(new Date(o.date), selectedDate)) && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const o = dailyOverrides.find((o) =>
                      isSameDay(new Date(o.date), selectedDate!),
                    );
                    if (o) handleDelete(o.id);
                  }}
                  className="size-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-all shrink-0"
                >
                  <Icon icon="solar:trash-bin-trash-bold-duotone" className="size-6" />
                </Button>
              )}
            <Button onClick={handleSave} className="flex-1 h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
              Update Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
