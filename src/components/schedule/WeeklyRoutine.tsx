import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchWeeklySchedule, updateWeeklySchedule } from '@/features/schedule/schedule.thunks';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import StylistBranchService from '@/services/stylistBranch.service';
import { showSuccess, showError, showLoading } from '@/common/utils/swal.utils';
import { cn } from '@/lib/utils';
import type { WeeklySchedule } from '@/features/schedule/schedule.types';
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface WeeklyRoutineProps {
  stylistId?: string;
  branchId?: string;
}

export default function WeeklyRoutine({
  stylistId: propStylistId,
  branchId: propBranchId,
}: WeeklyRoutineProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { weeklySchedule, loading } = useAppSelector((state) => state.schedule);
  const [editedSchedule, setEditedSchedule] = useState<Record<number, WeeklySchedule>>({});
  const [fetchedBranchId, setFetchedBranchId] = useState<string | null>(null);
  const [prevWeeklySchedule, setPrevWeeklySchedule] = useState(weeklySchedule);

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
      dispatch(fetchWeeklySchedule({ stylistId: effectiveStylistId, branchId: effectiveBranchId }));
    }
  }, [dispatch, effectiveStylistId, effectiveBranchId]);

  if (weeklySchedule !== prevWeeklySchedule) {
    setPrevWeeklySchedule(weeklySchedule);
    if (weeklySchedule.length > 0) {
      const scheduleMap = weeklySchedule.reduce(
        (acc, curr) => {
          acc[curr.dayOfWeek] = curr;
          return acc;
        },
        {} as Record<number, WeeklySchedule>,
      );
      setEditedSchedule(scheduleMap);
    }
  }

  const handleToggleWorkDay = async (day: number) => {
    const currentDay = editedSchedule[day] || { dayOfWeek: day, isWorkingDay: false, shifts: [] };
    const newIsWorkingDay = !currentDay.isWorkingDay;

    // When toggling ON, ensure there's a default shift
    const newShifts =
      newIsWorkingDay && currentDay.shifts.length === 0
        ? [{ startTime: '09:00', endTime: '18:00' }]
        : currentDay.shifts;

    const updatedDay = { ...currentDay, isWorkingDay: newIsWorkingDay, shifts: newShifts };

    // Update local state immediately for snappy UI
    setEditedSchedule((prev) => ({
      ...prev,
      [day]: updatedDay,
    }));

    // AUTO-SAVE on toggle
    if (effectiveStylistId && effectiveBranchId) {
      showLoading('Updating schedule...');
      try {
        await dispatch(
          updateWeeklySchedule({
            dayOfWeek: day,
            data: {
              stylistId: effectiveStylistId,
              branchId: effectiveBranchId,
              isWorkingDay: newIsWorkingDay,
              shifts: newShifts,
            },
          }),
        ).unwrap();
        showSuccess('Success', `${DAYS[day]} status updated`);
      } catch (error: unknown) {
        showError('Error', (error as string) || 'Failed to update schedule');
        // Revert local state on error
        setEditedSchedule((prev) => ({ ...prev })); // or trigger a re-sync from Redux
      }
    }
  };

  const handleTimeChange = (day: number, field: 'startTime' | 'endTime', value: string) => {
    const currentDay = editedSchedule[day];
    if (!currentDay) return;

    const newShifts = [...(currentDay.shifts || [])];
    if (newShifts.length === 0) {
      newShifts.push({ startTime: '09:00', endTime: '18:00' });
    }
    newShifts[0] = { ...newShifts[0], [field]: value };

    setEditedSchedule((prev) => ({
      ...prev,
      [day]: { ...currentDay, shifts: newShifts },
    }));
  };

  const handleSave = async (day: number) => {
    const data = editedSchedule[day];
    if (!data || !effectiveStylistId || !effectiveBranchId) return;

    showLoading('Saving shift times...');
    try {
      await dispatch(
        updateWeeklySchedule({
          dayOfWeek: day,
          data: {
            stylistId: effectiveStylistId,
            branchId: effectiveBranchId,
            isWorkingDay: data.isWorkingDay,
            shifts: data.shifts,
          },
        }),
      ).unwrap();
      showSuccess('Success', `${DAYS[day]} hours updated`);
    } catch (error: unknown) {
      showError('Error', (error as string) || 'Failed to update schedule');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-6 bg-primary/5 border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary tracking-tight">
                <Icon icon="solar:calendar-linear" className="size-7" />
                Weekly Routine
              </CardTitle>
              <CardDescription className="text-xs font-medium opacity-60">
                Define your standard working hours for each day of the week.
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <Badge
                variant="outline"
                className="h-7 px-3 rounded-full border-primary/20 text-primary font-medium text-[9px] tracking-wide"
              >
                RECURRING SCHEDULE
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {DAYS.map((dayName, index) => {
          const schedule = editedSchedule[index] || {
            dayOfWeek: index,
            isWorkingDay: false,
            shifts: [],
          };
          const shift = schedule.shifts?.[0] || { startTime: '09:00', endTime: '18:00' };

          return (
            <Card
              key={dayName}
              className={cn(
                'overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 rounded-2xl',
                schedule.isWorkingDay ? 'bg-white' : 'bg-muted/30 opacity-80',
              )}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5 min-w-[180px]">
                    <Switch
                      checked={schedule.isWorkingDay}
                      onCheckedChange={() => handleToggleWorkDay(index)}
                      className="data-[state=checked]:bg-green-500 scale-110"
                    />
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          'text-base font-semibold tracking-tight leading-none',
                          !schedule.isWorkingDay ? 'text-muted-foreground' : 'text-slate-800',
                        )}
                      >
                        {dayName}
                      </span>
                      <span className="text-[9px] font-medium text-muted-foreground mt-1">
                        {schedule.isWorkingDay ? 'Working' : 'Not Working'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    {schedule.isWorkingDay ? (
                      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="relative">
                          <Icon
                            icon="solar:clock-circle-linear"
                            className="absolute left-3 top-2.5 size-4 text-muted-foreground"
                          />
                          <Input
                            type="time"
                            value={shift.startTime}
                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                            className="pl-9 w-32 h-9 rounded-xl font-medium border-muted/50 focus:ring-primary/20 bg-muted/10 text-sm"
                          />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">
                          To
                        </span>
                        <div className="relative">
                          <Icon
                            icon="solar:clock-circle-linear"
                            className="absolute left-3 top-2.5 size-4 text-muted-foreground"
                          />
                          <Input
                            type="time"
                            value={shift.endTime}
                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                            className="pl-9 w-32 h-9 rounded-xl font-medium border-muted/50 focus:ring-primary/20 bg-muted/10 text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-muted-foreground/40 italic">
                        <Icon icon="solar:sleeping-bold" className="size-5" />
                        <span className="text-sm font-medium uppercase tracking-widest">
                          Taking a break
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end sm:min-w-[100px]">
                    <Button
                      size="sm"
                      variant={schedule.isWorkingDay ? 'default' : 'outline'}
                      className={cn(
                        'rounded-xl font-medium text-xs h-9 px-4 transition-all active:scale-95 group',
                        schedule.isWorkingDay
                          ? 'shadow-sm active:shadow-none'
                          : 'opacity-30 pointer-events-none',
                      )}
                      onClick={() => handleSave(index)}
                      disabled={loading || !schedule.isWorkingDay}
                    >
                      <Icon
                        icon="solar:diskette-linear"
                        className="size-4 mr-2 group-hover:scale-110 transition-transform"
                      />
                      Save Hours
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
