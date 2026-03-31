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
      <Card className="border-border/40 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="pb-6 bg-muted/30 border-b border-border/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2.5 text-foreground">
                <div className="size-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Icon icon="solar:calendar-bold-duotone" className="size-6 text-primary/80" />
                </div>
                Weekly Routine
              </CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground/50 mt-1 md:ml-12">
                Define your default working hours for each day of the week.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-xl px-4 py-1 text-[10px] font-semibold uppercase tracking-wider bg-primary/5 text-primary/70 border-primary/10">
              Recurring Schedule
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {DAYS.map((dayName, index) => {
              const schedule = editedSchedule[index] || {
                dayOfWeek: index,
                isWorkingDay: false,
                shifts: [],
              };
              const shift = schedule.shifts?.[0] || { startTime: '09:00', endTime: '18:00' };

              return (
                <div
                  key={dayName}
                  className={cn(
                    'group transition-colors duration-200',
                    schedule.isWorkingDay ? 'bg-background' : 'bg-muted/10 opacity-70'
                  )}
                >
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6 sm:w-64">
                      <div className="relative">
                        <Switch
                          checked={schedule.isWorkingDay}
                          onCheckedChange={() => handleToggleWorkDay(index)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          'text-lg font-semibold tracking-tight',
                          !schedule.isWorkingDay ? 'text-muted-foreground' : 'text-foreground'
                        )}>
                          {dayName}
                        </span>
                        <span className={cn(
                          'text-[10px] font-semibold uppercase tracking-wider',
                          schedule.isWorkingDay ? 'text-green-600' : 'text-muted-foreground/60'
                        )}>
                          {schedule.isWorkingDay ? 'Working' : 'Not Working'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center sm:justify-start">
                      {schedule.isWorkingDay ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-muted/30 p-3 sm:p-2 sm:px-4 rounded-2xl border border-border/20 shadow-sm transition-all hover:bg-muted/50 w-full sm:w-auto">
                          <div className="flex items-center gap-2 justify-between sm:justify-start">
                             <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-background flex items-center justify-center shadow-sm border border-border/10">
                                  <Icon icon="solar:clock-circle-bold-duotone" className="size-4 text-primary" />
                                </div>
                                <span className="text-[10px] sm:hidden font-bold text-muted-foreground/40 uppercase">From</span>
                             </div>
                             <Input
                                type="time"
                                value={shift.startTime}
                                onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                className="w-24 sm:w-28 h-9 border-none bg-transparent focus-visible:ring-0 text-sm font-semibold p-0 text-right sm:text-left"
                             />
                          </div>
                          
                          <div className="hidden sm:block size-1 rounded-full bg-border" />

                          <div className="flex items-center gap-2 justify-between sm:justify-start">
                             <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-background flex items-center justify-center shadow-sm border border-border/10">
                                  <Icon icon="solar:clock-circle-bold-duotone" className="size-4 text-primary" />
                                </div>
                                <span className="text-[10px] sm:hidden font-bold text-muted-foreground/40 uppercase">To</span>
                             </div>
                             <Input
                                type="time"
                                value={shift.endTime}
                                onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                className="w-24 sm:w-28 h-9 border-none bg-transparent focus-visible:ring-0 text-sm font-semibold p-0 text-right sm:text-left"
                             />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 py-3 text-muted-foreground/30">
                          <Icon icon="solar:sleeping-bold-duotone" className="size-5" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Off Duty</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={schedule.isWorkingDay ? 'default' : 'ghost'}
                        className={cn(
                          'rounded-xl text-xs font-semibold h-10 px-6 transition-all duration-300',
                          schedule.isWorkingDay 
                            ? 'bg-primary text-white shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5' 
                            : 'opacity-0 pointer-events-none group-hover:opacity-10'
                        )}
                        onClick={() => handleSave(index)}
                        disabled={loading || !schedule.isWorkingDay}
                      >
                        <Icon icon="solar:diskette-bold-duotone" className="size-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
