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
import { toast } from 'sonner';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { Icon } from '@iconify/react';
import { slotService } from '@/services/slot.service';
import type { Slot } from '@/services/slot.service';
import { cn } from '@/lib/utils';

export default function DailyAdjustments({ stylistId: propStylistId, branchId: propBranchId }: { stylistId?: string; branchId?: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { dailyOverrides, loading } = useAppSelector((state) => state.schedule);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  
  // Day Preview State
  const [daySlots, setDaySlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const effectiveStylistId = propStylistId || user?.id;
  const effectiveBranchId = propBranchId || user?.branchId;

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
            stylistId: effectiveStylistId
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
    return dailyOverrides.find(o => isSameDay(parseISO(o.date), selectedDate));
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
      toast.error('Please select a date');
      return;
    }

    if (!effectiveStylistId || !effectiveBranchId) {
      toast.error('Error: Missing branch or stylist information');
      return;
    }

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
      toast.success('Adjustment saved');
    } catch (error: unknown) {
      toast.error((error as string) || 'Failed to save adjustment');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteDailyOverride(id)).unwrap();
      toast.success('Adjustment removed');
    } catch (error: unknown) {
      toast.error((error as string) || 'Failed to remove adjustment');
    }
  };

  // Custom component to render indicators on the calendar
  const modifiers = {
    hasOverride: dailyOverrides.map(o => parseISO(o.date)),
  };

  const modifiersStyles = {
    hasOverride: {
      fontWeight: 'bold',
      color: 'hsl(var(--primary))',
      textDecoration: 'underline'
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section with Date Picker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl bg-card border shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon icon="solar:calendar-date-bold" className="text-primary size-7" />
            Daily Adjustments
          </h2>
          <p className="text-muted-foreground">Customize your schedule for specific dates.</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-14 px-6 rounded-2xl flex items-center gap-3 border-primary/20 hover:border-primary transition-all">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase text-primary/60 leading-none mb-1">Select Date</p>
                <p className="text-lg font-bold leading-none">{selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}</p>
              </div>
              <Icon icon="solar:alt-arrow-down-bold" className="size-5 text-muted-foreground ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-none" align="end">
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Adjustment Sidebar (Future/Active Overrides) */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-none shadow-lg h-full max-h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon icon="solar:history-bold" className="text-primary" />
                Active Overrides
              </CardTitle>
              <CardDescription>Upcoming adjustments you've made.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-6">
              {dailyOverrides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Icon icon="solar:calendar-minimalistic-linear" className="size-10 mb-2" />
                  <p className="text-sm italic">No active overrides</p>
                </div>
              ) : (
                dailyOverrides
                  .filter((o) => startOfDay(parseISO(o.date)) >= startOfDay(new Date()))
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((override) => (
                    <div
                      key={override.id}
                      onClick={() => setSelectedDate(parseISO(override.date))}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:border-primary/50",
                        isSameDay(parseISO(override.date), selectedDate || new Date()) 
                          ? "bg-primary/10 border-primary shadow-sm" 
                          : "bg-muted/30 border-transparent hover:bg-muted/50"
                      )}
                    >
                      <div>
                        <p className="font-bold text-sm tracking-tight">{format(parseISO(override.date), 'EEE, MMM d')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={override.isWorkingDay ? "secondary" : "destructive"} className="h-4 text-[9px] px-1 font-bold">
                            {override.isWorkingDay ? 'SHIFT' : 'OFF'}
                          </Badge>
                          {override.isWorkingDay && (
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {override.shifts[0]?.startTime}-{override.shifts[0]?.endTime}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(override.id);
                        }}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                      </Button>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Workspace Area */}
        <div className="xl:col-span-3">
          {selectedDate ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Form Card */}
              <Card className="lg:col-span-2 border-none shadow-lg h-fit">
                <CardHeader className="pb-3 border-b mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-primary font-bold">
                        Adjust Schedule
                      </CardTitle>
                      <CardDescription>{format(selectedDate, 'PPPP')}</CardDescription>
                    </div>
                    {existingOverride && <Badge variant="outline" className="text-primary border-primary/20">Edit Mode</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-dashed">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        isWorkingDay ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        <Icon icon={isWorkingDay ? "solar:walking-bold" : "solar:sleeping-bold"} className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{isWorkingDay ? 'Working Day' : 'Mark as Off-Day'}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {isWorkingDay ? 'Customers can book new slots.' : 'This date will be blocked.'}
                        </p>
                      </div>
                    </div>
                    <Switch checked={isWorkingDay} onCheckedChange={setIsWorkingDay} />
                  </div>

                  {isWorkingDay && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Start Time</label>
                        <div className="relative">
                          <Icon icon="solar:clock-circle-linear" className="absolute left-3 top-3 size-4 text-muted-foreground" />
                          <Input
                            type="time"
                            className="pl-9 h-11 rounded-2xl"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">End Time</label>
                        <div className="relative">
                          <Icon icon="solar:clock-circle-linear" className="absolute left-3 top-3 size-4 text-muted-foreground" />
                          <Input
                            type="time"
                            className="pl-9 h-11 rounded-2xl"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Adjustment Reason</label>
                    <Input
                      placeholder="e.g. Training session, Holiday"
                      className="h-11 rounded-2xl"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-95" 
                      onClick={handleSave} 
                      disabled={loading}
                    >
                      {loading ? (
                        <Icon icon="eos-icons:loading" className="size-5 animate-spin mr-2" />
                      ) : (
                        <Icon icon="solar:check-circle-bold" className="size-5 mr-2" />
                      )}
                      {existingOverride ? 'Update Adjustment' : 'Save Adjustment'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Day Preview Card */}
              <Card className="lg:col-span-3 border-none shadow-lg overflow-hidden">
                <CardHeader className="pb-3 bg-primary/5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Icon icon="solar:mask-h-bold" className="text-primary" />
                    Day Map Preview
                  </CardTitle>
                  <CardDescription>Live availability check with current settings.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {slotsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                      <Icon icon="eos-icons:loading" className="size-8 animate-spin" />
                      <p className="text-sm font-medium">Crunching slot data...</p>
                    </div>
                  ) : !isWorkingDay ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-red-50/50 rounded-3xl border border-red-100 border-dashed">
                      <div className="p-4 bg-red-100 rounded-full">
                        <Icon icon="solar:ghost-bold" className="size-10 text-red-600" />
                      </div>
                      <div>
                        <p className="font-bold text-red-800 text-lg">No Slots Available</p>
                        <p className="text-sm text-red-600/70 max-w-[200px] mx-auto">Customers won't see any booking options for this day.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {daySlots.map(slot => (
                          <div 
                            key={slot.id}
                            className={cn(
                              "relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all",
                              slot.status === 'BOOKED' 
                                ? "bg-green-100 border-green-200 text-green-800 shadow-sm" 
                                : slot.status === 'BLOCKED'
                                ? "bg-red-50 border-red-100 text-red-700 opacity-60"
                                : "bg-muted/30 border-transparent text-muted-foreground/60"
                            )}
                          >
                            <p className="text-[8px] font-black uppercase tracking-tighter opacity-50 mb-0.5">{slot.status}</p>
                            <p className="text-xs font-bold leading-none">{slot.startTime}</p>
                            {slot.status === 'BOOKED' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />}
                          </div>
                        ))}
                        {daySlots.length === 0 && (
                          <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/10 rounded-3xl border border-dashed italic">
                            No slots generated for this time range.
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <Icon icon="solar:info-square-bold" className="size-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-primary uppercase mb-0.5">Stylist Dashboard Context</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Green blocks indicate confirmed bookings. All slots are generated in 15-minute grids based on your shift hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] bg-card/50 rounded-3xl border border-dashed border-muted-foreground/20">
              <Icon icon="solar:calendar-search-linear" className="size-16 text-muted-foreground/30 mb-4" />
              <p className="font-bold text-muted-foreground/60">Select a date to begin adjustment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
