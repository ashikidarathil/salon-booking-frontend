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
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-6 bg-primary/5 border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary tracking-tight">
                <Icon icon="solar:calendar-date-linear" className="size-7" />
                Daily Adjustments
              </CardTitle>
              <CardDescription className="text-xs font-medium opacity-60">
                Override your standard routine for specific dates (holidays, extra shifts).
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="h-9 w-9 rounded-xl hover:bg-slate-50 text-slate-600"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="size-5" />
              </Button>
              <span className="text-sm font-bold text-slate-700 min-w-[120px] text-center px-4 tracking-tight">
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
                'aspect-square rounded-2xl p-2 relative transition-all duration-300 group flex flex-col items-center justify-center gap-1 border border-transparent',
                past
                  ? 'opacity-30 cursor-not-allowed bg-slate-50/50'
                  : 'hover:border-primary/20 hover:shadow-md active:scale-95',
                isTodayDate
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-white shadow-sm border-slate-100',
                override &&
                  (override.isWorkingDay
                    ? 'ring-2 ring-primary/20 bg-primary/[0.02]'
                    : 'ring-2 ring-red-100 bg-red-50/30'),
              )}
            >
              <span
                className={cn(
                  'text-sm font-bold tracking-tight',
                  isTodayDate ? 'text-primary' : past ? 'text-slate-300' : 'text-slate-600',
                  override && !override.isWorkingDay && 'text-red-500',
                )}
              >
                {format(date, 'd')}
              </span>

              {override && (
                <div className="flex flex-col items-center gap-0.5 animate-in fade-in zoom-in duration-500 mt-1">
                  <Badge
                    variant={override.isWorkingDay ? 'default' : 'destructive'}
                    className={cn(
                      'scale-[0.7] px-2 h-4 text-[8px] font-black uppercase tracking-tighter whitespace-nowrap rounded-lg shadow-sm',
                      override.isWorkingDay ? 'bg-primary' : 'bg-red-500',
                    )}
                  >
                    {override.isWorkingDay ? 'SHIFTS' : 'OFF'}
                  </Badge>
                  {override.isWorkingDay && override.shifts[0] && (
                    <span className="text-[8px] font-bold text-slate-400 leading-none">
                      {override.shifts[0].startTime}
                    </span>
                  )}
                </div>
              )}

              {isTodayDate && !override && (
                <div className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] gap-0 p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Icon icon="solar:calendar-edit-linear" className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">
                  Adjust Schedule
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-8 bg-white">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-colors">
              <div className="space-y-1">
                <Label className="text-sm font-bold text-slate-700">Working Day</Label>
                <p className="text-[10px] text-slate-400 font-medium">
                  Toggle availability for this date
                </p>
              </div>
              <Switch
                checked={isWorkingDay}
                onCheckedChange={setIsWorkingDay}
                className="data-[state=checked]:bg-green-500 scale-110"
              />
            </div>

            {isWorkingDay && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col gap-3">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Shift Hours
                  </Label>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] font-bold text-slate-500 ml-1">START</Label>
                      <div className="relative">
                        <Icon
                          icon="solar:clock-circle-linear"
                          className="absolute left-3 top-2.5 size-4 text-primary/50"
                        />
                        <Input
                          type="time"
                          value={shifts[0]?.startTime}
                          onChange={(e) => handleTimeChange(0, 'startTime', e.target.value)}
                          className="pl-9 h-10 rounded-xl border-none bg-white shadow-sm font-bold text-slate-700 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="h-10 border-r border-slate-200 mt-5 opacity-50" />
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] font-bold text-slate-500 ml-1">END</Label>
                      <div className="relative">
                        <Icon
                          icon="solar:clock-circle-linear"
                          className="absolute left-3 top-2.5 size-4 text-primary/50"
                        />
                        <Input
                          type="time"
                          value={shifts[0]?.endTime}
                          onChange={(e) => handleTimeChange(0, 'endTime', e.target.value)}
                          className="pl-9 h-10 rounded-xl border-none bg-white shadow-sm font-bold text-slate-700 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Reason (Optional)
              </Label>
              <Input
                placeholder="e.g. Special Holiday, Extra Shift"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium placeholder:text-slate-300 focus-visible:ring-primary/10"
              />
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 gap-3">
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
                  className="rounded-xl h-12 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 font-bold px-6 flex-none active:scale-95 transition-all"
                >
                  <Icon icon="solar:trash-bin-trash-linear" className="size-5" />
                </Button>
              )}
            <Button
              onClick={handleSave}
              className="flex-1 rounded-xl h-12 bg-primary hover:bg-primary/95 text-white font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
            >
              Update Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
