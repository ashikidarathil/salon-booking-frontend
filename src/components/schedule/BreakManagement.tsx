import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBreaks, createBreak, deleteBreak } from '@/features/schedule/schedule.thunks';
import { branchService } from '@/services/branch.service';
import { stylistBranchService } from '@/services/stylistBranch.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError, showConfirm, showLoading } from '@/common/utils/swal.utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@iconify/react';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { StylistBreak, CreateStylistBreakDto } from '@/features/schedule/schedule.types';
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';

interface DefaultBreak {
  startTime: string;
  endTime: string;
  description: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BREAK_PRESETS = [
  { label: 'Lunch Break (1h)', startTime: '13:00', endTime: '14:00', description: 'Lunch Break' },
  { label: 'Tea Break (30m)', startTime: '16:00', endTime: '16:30', description: 'Tea Break' },
  { label: 'Custom', startTime: '12:00', endTime: '12:30', description: '' },
];

export default function BreakManagement({
  stylistId: propStylistId,
  branchId: propBranchId,
}: {
  stylistId?: string;
  branchId?: string;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { breaks, loading: thunkLoading } = useAppSelector((state) => state.schedule);
  const [defaultBreaks, setDefaultBreaks] = useState<DefaultBreak[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const calculateTotalMinutes = (breakList: StylistBreak[]) => {
    return breakList.reduce((total, b) => {
      return total + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
    }, 0);
  };
  const [fetchedBranchId, setFetchedBranchId] = useState<string | null>(null);

  const effectiveStylistId = propStylistId || user?.id;
  const effectiveBranchId = propBranchId || user?.branchId || fetchedBranchId;

  const [newBreak, setNewBreak] = useState<Partial<CreateStylistBreakDto>>({
    startTime: '13:00',
    endTime: '14:00',
    dayOfWeek: 1,
    description: 'Lunch Break',
  });

  const [activeTab, setActiveTab] = useState<'recurring' | 'one-off'>('recurring');

  useEffect(() => {
    const fetchStylistBranch = async () => {
      if (!propBranchId && !user?.branchId && effectiveStylistId && user?.role === 'STYLIST') {
        try {
          const response = await stylistBranchService.getStylistBranches(effectiveStylistId);
          const branches = response.data.data;
          if (branches.length > 0) {
            const activeBranch = branches.find((b: BranchStylist) => b.mappingId); // Use mappingId or similar to check focus
            setFetchedBranchId(activeBranch?.branchId || branches[0].branchId);
          }
        } catch (error) {
          console.error('Failed to fetch stylist branch:', error);
        }
      }
    };
    fetchStylistBranch();
  }, [propBranchId, user?.branchId, effectiveStylistId, user?.role]);

  const loadData = async () => {
    if (!effectiveStylistId || !effectiveBranchId) return;
    setInternalLoading(true);
    try {
      const branchRes = await branchService.getPublic(effectiveBranchId);
      setDefaultBreaks(branchRes.data.data.defaultBreaks || []);
      await dispatch(
        fetchBreaks({ stylistId: effectiveStylistId, branchId: effectiveBranchId }),
      ).unwrap();
    } catch {
      showError('Error', 'Failed to fetch schedule data');
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveStylistId, effectiveBranchId]);

  const handleCreateBreak = async () => {
    if (!effectiveStylistId || !effectiveBranchId) return;

    if (!newBreak.startTime || !newBreak.endTime) {
      showError('Error', 'Please select both start and end times');
      return;
    }

    const duration = timeToMinutes(newBreak.endTime!) - timeToMinutes(newBreak.startTime!);
    const dailyCustom = breaks.filter((b) =>
      activeTab === 'recurring' ? b.dayOfWeek === newBreak.dayOfWeek : b.date === newBreak.date,
    );
    const existingMinsForDay = calculateTotalMinutes(dailyCustom);

    if (existingMinsForDay + duration > 90) {
      showError(
        'Limit Exceeded',
        `Total break time for this day cannot exceed 90 minutes. You already have ${existingMinsForDay} mins of overrides.`,
      );
      return;
    }

    showLoading('Adding break...');
    try {
      const payload: CreateStylistBreakDto = {
        stylistId: effectiveStylistId!,
        branchId: effectiveBranchId!,
        startTime: newBreak.startTime!,
        endTime: newBreak.endTime!,
        description: newBreak.description,
        ...(activeTab === 'recurring'
          ? { dayOfWeek: newBreak.dayOfWeek }
          : { date: newBreak.date }),
      };

      await dispatch(createBreak(payload)).unwrap();
      showSuccess('Success', 'Break added successfully');
    } catch (error) {
      showError('Error', (error as string) || 'Failed to add break');
    }
  };

  const handleDeleteBreak = async (id: string) => {
    const confirmed = await showConfirm(
      'Delete Break?',
      'Are you sure you want to remove this break?',
    );

    if (!confirmed) return;

    showLoading('Deleting break...');
    try {
      await dispatch(deleteBreak(id)).unwrap();
      showSuccess('Success', 'Break deleted');
    } catch (error) {
      showError('Error', (error as string) || 'Failed to delete break');
    }
  };

  const recurringBreaks = breaks.filter((b) => b.dayOfWeek !== undefined);
  const oneOffBreaks = breaks.filter((b) => b.date !== undefined);

  return (
    <div className="space-y-6">
      {/* Top Creation Section */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-3 bg-primary/5 border-b mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary">
                <Icon icon="solar:tea-cup-bold" className="size-6" />
                Special Adjustments / Emergency Breaks
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add temporary or recurring breaks to your schedule.
              </p>
            </div>
            <div className="text-[10px] uppercase font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 w-fit">
              Note: Lunch/Tea breaks are automatic.
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'recurring' | 'one-off')}
            className="w-full"
          >
            <TabsList className="mb-6 h-12 p-1 bg-muted/50 rounded-2xl w-full sm:w-fit">
              <TabsTrigger
                value="recurring"
                className="rounded-xl px-8 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all focus-visible:ring-0"
              >
                Recurring
              </TabsTrigger>
              <TabsTrigger
                value="one-off"
                className="rounded-xl px-8 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all focus-visible:ring-0"
              >
                Specific Date
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Break Type
                </label>
                <div className="relative">
                  <Icon
                    icon="solar:hamburger-menu-linear"
                    className="absolute left-3 top-3 size-4 text-muted-foreground"
                  />
                  <select
                    className="w-full h-11 pl-9 pr-3 py-2 rounded-2xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    onChange={(e) => {
                      const preset = BREAK_PRESETS[parseInt(e.target.value)];
                      if (preset) {
                        setNewBreak({ ...newBreak, ...preset });
                      }
                    }}
                  >
                    {BREAK_PRESETS.map((p, idx) => (
                      <option key={p.label} value={idx}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeTab === 'recurring' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                    Day of Week
                  </label>
                  <div className="relative">
                    <Icon
                      icon="solar:calendar-minimalistic-linear"
                      className="absolute left-3 top-3 size-4 text-muted-foreground"
                    />
                    <select
                      className="w-full h-11 pl-9 pr-3 py-2 rounded-2xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      value={newBreak.dayOfWeek}
                      onChange={(e) =>
                        setNewBreak({ ...newBreak, dayOfWeek: parseInt(e.target.value) })
                      }
                    >
                      {DAYS.map((day, idx) => (
                        <option key={day} value={idx}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                    Date
                  </label>
                  <div className="relative">
                    <Icon
                      icon="solar:calendar-date-linear"
                      className="absolute left-3 top-3 size-4 text-muted-foreground"
                    />
                    <Input
                      type="date"
                      className="h-11 pl-9 rounded-2xl"
                      value={newBreak.date || ''}
                      onChange={(e) => setNewBreak({ ...newBreak, date: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Start Time
                </label>
                <div className="relative">
                  <Icon
                    icon="solar:clock-circle-linear"
                    className="absolute left-3 top-3 size-4 text-muted-foreground"
                  />
                  <Input
                    type="time"
                    className="h-11 pl-9 rounded-2xl"
                    value={newBreak.startTime}
                    onChange={(e) => setNewBreak({ ...newBreak, startTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  End Time
                </label>
                <div className="relative">
                  <Icon
                    icon="solar:clock-circle-linear"
                    className="absolute left-3 top-3 size-4 text-muted-foreground"
                  />
                  <Input
                    type="time"
                    className="h-11 pl-9 rounded-2xl"
                    value={newBreak.endTime}
                    onChange={(e) => setNewBreak({ ...newBreak, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Description
                </label>
                <Input
                  placeholder="e.g. Lunch"
                  className="h-11 rounded-2xl"
                  value={newBreak.description}
                  onChange={(e) => setNewBreak({ ...newBreak, description: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-5 flex justify-end">
                <Button
                  onClick={handleCreateBreak}
                  className="h-12 px-10 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
                  disabled={thunkLoading || internalLoading}
                >
                  <Icon icon="solar:add-circle-bold" className="size-5 mr-2" />
                  Add Break
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
              <Icon icon="solar:info-square-bold" className="size-5 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary uppercase mr-1">Policy:</span>
                Stylists are limited to 2 breaks per day (e.g., Lunch and Tea). Adding a custom
                break for a specific day will override any branch default breaks for that date.
                {user?.role === 'ADMIN' && (
                  <span className="ml-1 text-green-600 font-semibold">(Admin Bypass Active)</span>
                )}
              </p>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar: Branch Defaults */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-none shadow-lg bg-muted/30 border-dashed h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="solar:lock-keyhole-minimalistic-bold" className="text-primary" />
                Branch Defaults
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium">
                Standard rules for this branch.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                <strong>NOTE:</strong> If you add ANY custom break for a day, these defaults are
                skipped for that day.
              </div>

              <div className="space-y-2">
                {defaultBreaks.map((gb, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-white rounded-xl border shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-700">{gb.description}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">
                        Standard Rule
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-semibold text-[10px] h-6">
                      {gb.startTime}-{gb.endTime}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t mt-4 space-y-2.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider">
                    Branch Total:
                  </span>
                  <span className="font-semibold">
                    {calculateTotalMinutes(
                      defaultBreaks.map(
                        (db) =>
                          ({ ...db, id: 'temp', stylistId: '', branchId: '' }) as StylistBreak,
                      ),
                    )}{' '}
                    mins
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider">
                    Custom Edits:
                  </span>
                  <span className="font-semibold text-primary">
                    {calculateTotalMinutes(
                      breaks.filter((b) =>
                        activeTab === 'recurring'
                          ? b.dayOfWeek === newBreak.dayOfWeek
                          : b.date === newBreak.date,
                      ),
                    )}{' '}
                    mins
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center text-xs font-semibold">
                  <span className="uppercase tracking-widest text-slate-800">Active Total:</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {(() => {
                      const dailyCustom = breaks.filter((b) =>
                        activeTab === 'recurring'
                          ? b.dayOfWeek === newBreak.dayOfWeek
                          : b.date === newBreak.date,
                      );
                      const total =
                        dailyCustom.length > 0
                          ? calculateTotalMinutes(dailyCustom)
                          : calculateTotalMinutes(
                              defaultBreaks.map(
                                (db) =>
                                  ({
                                    ...db,
                                    id: 'temp',
                                    stylistId: '',
                                    branchId: '',
                                  }) as StylistBreak,
                              ),
                            );
                      return `${total} / 90 mins`;
                    })()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area: Tables with full width */}
        <div className="xl:col-span-3 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Icon icon="solar:restart-bold" className="text-primary" />
                  Recurring Breaks
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fixed breaks based on days of the week.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-xs uppercase tracking-widest h-10">
                        Day
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-widest h-10">
                        Time Window
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-widest h-10">
                        Description
                      </TableHead>
                      <TableHead className="h-10 text-right pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recurringBreaks.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-12 italic"
                        >
                          No recurring breaks defined
                        </TableCell>
                      </TableRow>
                    ) : (
                      recurringBreaks.map((b) => (
                        <TableRow
                          key={b.id}
                          className="hover:bg-muted/20 transition-colors border-muted/50"
                        >
                          <TableCell className="font-semibold text-sm">
                            {DAYS[b.dayOfWeek!]}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-xs bg-muted px-2 py-1 rounded-lg border">
                              {b.startTime} - {b.endTime}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-medium">
                            {b.description || '-'}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive transition-all"
                              onClick={() => handleDeleteBreak(b.id)}
                            >
                              <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Icon icon="solar:calendar-date-bold" className="text-primary" />
                  One-off Breaks
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjustments for specific dates only.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-xs uppercase tracking-widest h-10">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-widest h-10">
                        Time Window
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-widest h-10">
                        Description
                      </TableHead>
                      <TableHead className="h-10 text-right pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oneOffBreaks.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-12 italic"
                        >
                          No specific date breaks defined
                        </TableCell>
                      </TableRow>
                    ) : (
                      oneOffBreaks.map((b) => (
                        <TableRow
                          key={b.id}
                          className="hover:bg-muted/20 transition-colors border-muted/50"
                        >
                          <TableCell className="font-semibold text-sm">
                            {new Date(b.date!).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-xs bg-muted px-2 py-1 rounded-lg border">
                              {b.startTime} - {b.endTime}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-medium">
                            {b.description || '-'}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive transition-all"
                              onClick={() => handleDeleteBreak(b.id)}
                            >
                              <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
