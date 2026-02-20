import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchWeeklySchedule, updateWeeklySchedule } from '@/features/schedule/schedule.thunks';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { stylistBranchService } from '@/services/stylistBranch.service';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

import type { WeeklySchedule } from '../schedule.types';

export default function WeeklyRoutine({ stylistId: propStylistId, branchId: propBranchId }: { stylistId?: string; branchId?: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { weeklySchedule, loading } = useAppSelector((state) => state.schedule);
  const [editedSchedule, setEditedSchedule] = useState<Record<number, WeeklySchedule>>({});
  const [fetchedBranchId, setFetchedBranchId] = useState<string | null>(null);

  const effectiveStylistId = propStylistId || user?.id;
  const effectiveBranchId = propBranchId || user?.branchId || fetchedBranchId;

  console.log('🔍 WeeklyRoutine Debug:', {
    propStylistId,
    propBranchId,
    userId: user?.id,
    userBranchId: user?.branchId,
    fetchedBranchId,
    effectiveStylistId,
    effectiveBranchId,
    loading,
    userRole: user?.role,
  });

  // Fetch stylist's branch if not provided and user is a stylist
  useEffect(() => {
    const fetchStylistBranch = async () => {
      if (!propBranchId && !user?.branchId && effectiveStylistId && user?.role === 'STYLIST') {
        try {
          console.log('🔍 Fetching stylist branch assignment...');
          const response = await stylistBranchService.getStylistBranches(effectiveStylistId);
          const branches = response.data.data;
          if (branches.length > 0) {
            const activeBranch = branches.find((b: any) => b.isActive);
            const branchId = activeBranch?.branchId || branches[0].branchId;
            console.log('✅ Found branch:', branchId);
            setFetchedBranchId(branchId);
          } else {
            console.warn('⚠️ No branch assignments found for stylist');
          }
        } catch (error) {
          console.error('❌ Failed to fetch stylist branch:', error);
        }
      }
    };
    fetchStylistBranch();
  }, [propBranchId, user?.branchId, effectiveStylistId, user?.role]);

  useEffect(() => {
    if (effectiveStylistId && effectiveBranchId) {
      console.log('📡 Fetching weekly schedule for:', { effectiveStylistId, effectiveBranchId });
      dispatch(fetchWeeklySchedule({ stylistId: effectiveStylistId, branchId: effectiveBranchId }));
    } else {
      console.warn('⚠️ Cannot fetch schedule - missing:', {
        stylistId: effectiveStylistId,
        branchId: effectiveBranchId,
      });
    }
  }, [dispatch, effectiveStylistId, effectiveBranchId]);

  useEffect(() => {
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
  }, [weeklySchedule]);

  const handleToggleWorkDay = (day: number) => {
    const currentDay = editedSchedule[day] || { dayOfWeek: day, isWorkingDay: false, shifts: [] };
    const newIsWorkingDay = !currentDay.isWorkingDay;
    
    // When toggling ON, ensure there's a default shift
    const newShifts = newIsWorkingDay && currentDay.shifts.length === 0
      ? [{ startTime: '09:00', endTime: '18:00' }]
      : currentDay.shifts;
    
    setEditedSchedule({
      ...editedSchedule,
      [day]: { ...currentDay, isWorkingDay: newIsWorkingDay, shifts: newShifts },
    });
  };

  const handleTimeChange = (day: number, field: 'startTime' | 'endTime', value: string) => {
    const currentDay = editedSchedule[day];
    if (!currentDay) return;

    const newShifts = [...(currentDay.shifts || [])];
    if (newShifts.length === 0) {
      newShifts.push({ startTime: '09:00', endTime: '18:00' });
    }
    newShifts[0] = { ...newShifts[0], [field]: value };

    setEditedSchedule({
      ...editedSchedule,
      [day]: { ...currentDay, shifts: newShifts },
    });
  };

  const handleSave = async (day: number) => {
    const data = editedSchedule[day];
    console.log('💾 Save button clicked for day:', day, {
      data,
      effectiveStylistId,
      effectiveBranchId,
      loading,
    });

    if (!data) {
      console.error('❌ No data for this day');
      return;
    }

    if (!effectiveStylistId || !effectiveBranchId) {
      console.error('❌ Missing stylist or branch ID:', { effectiveStylistId, effectiveBranchId });
      toast.error('Error: Missing branch or stylist information');
      return;
    }

    try {
      console.log('📤 Dispatching updateWeeklySchedule...');
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
      console.log('✅ Schedule updated successfully');
      toast.success(`${DAYS[day]} schedule updated`);
    } catch (error: unknown) {
      console.error('❌ Failed to update schedule:', error);
      toast.error((error as string) || 'Failed to update schedule');
    }
  };

  return (
    <div className="space-y-4">
      {DAYS.map((dayName, index) => {
        const schedule = editedSchedule[index] || {
          dayOfWeek: index,
          isWorkingDay: false,
          shifts: [],
        };
        const shift = schedule.shifts?.[0] || { startTime: '09:00', endTime: '18:00' };

        return (
          <Card key={dayName} className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-[140px]">
                  <Switch
                    checked={schedule.isWorkingDay}
                    onCheckedChange={() => handleToggleWorkDay(index)}
                  />
                  <span
                    className={`font-medium ${!schedule.isWorkingDay ? 'text-muted-foreground' : ''}`}
                  >
                    {dayName}
                  </span>
                </div>

                {schedule.isWorkingDay ? (
                  <div className="flex items-center gap-2 flex-1 sm:justify-center">
                    <Input
                      type="time"
                      value={shift.startTime}
                      onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                ) : (
                  <div className="flex-1 sm:text-center text-muted-foreground italic text-sm">
                    Off Day
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave(index)}
                  disabled={loading}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
