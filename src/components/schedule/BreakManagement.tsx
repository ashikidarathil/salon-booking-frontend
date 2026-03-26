import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBreaks, createBreak, deleteBreak } from '@/features/schedule/schedule.thunks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { format, isBefore, startOfToday } from 'date-fns';

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
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';


interface BreakManagementProps {
  stylistId?: string;
  branchId?: string;
}

export default function BreakManagement({
  stylistId: propStylistId,
  branchId: propBranchId,
}: BreakManagementProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { breaks, loading } = useAppSelector((state) => state.schedule);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('14:00');
  const [description, setDescription] = useState('Lunch Break');
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
      dispatch(fetchBreaks({ stylistId: effectiveStylistId, branchId: effectiveBranchId }));
    }
  }, [dispatch, effectiveStylistId, effectiveBranchId]);

  const handleCreateBreak = async () => {
    if (!effectiveStylistId || !effectiveBranchId) return;

    showLoading('Adding break...');
    try {
      await dispatch(
        createBreak({
          stylistId: effectiveStylistId,
          branchId: effectiveBranchId,
          date,
          startTime,
          endTime,
          description,
        }),
      ).unwrap();

      showSuccess('Success', 'Break added to your schedule');
      setIsDialogOpen(false);
    } catch (error: unknown) {
      showError('Error', (error as string) || 'Failed to add break');
    }
  };

  const handleDeleteBreak = async (breakId: string) => {
    const confirmed = await showConfirm(
      'Remove break?',
      'This time slot will become available for bookings again.',
      'Yes, remove',
    );

    if (confirmed) {
      showLoading('Removing break...');
      try {
        await dispatch(deleteBreak(breakId)).unwrap();
        showSuccess('Success', 'Break removed');
      } catch (error: unknown) {
        showError('Error', (error as string) || 'Failed to remove break');
      }
    }
  };

  const upcomingBreaks = breaks
    .filter((b) => !isBefore(new Date(b.date!), startOfToday()))
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-6 bg-primary/5 border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary tracking-tight">
                <Icon icon="solar:tea-cup-linear" className="size-7" />
                Break Management
              </CardTitle>
              <CardDescription className="text-xs font-medium opacity-60">
                Schedule personal time or lunch breaks to block your calendar.
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="rounded-2xl h-11 px-6 bg-primary hover:bg-primary/95 text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Icon icon="solar:add-circle-linear" className="size-5" />
              Schedule New Break
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcomingBreaks.length > 0 ? (
          upcomingBreaks.map((item) => (
            <Card
              key={item.id}
              className="group border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[2rem] overflow-hidden bg-white"
            >
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full w-fit">
                        {format(new Date(item.date!), 'EEEE')}
                      </p>
                      <h4 className="text-base font-bold text-slate-800 tracking-tight">
                        {format(new Date(item.date!), 'MMMM do, yyyy')}
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBreak(item.id)}
                      className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" className="size-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                      <Icon icon="solar:clock-circle-bold" className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">
                        {item.startTime} - {item.endTime}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        Duration Scheduled
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <div className="flex items-center gap-2 px-1">
                      <Icon icon="solar:notes-linear" className="size-3.5 text-slate-400" />
                      <p className="text-xs font-medium text-slate-500 italic truncate italic">
                        "{item.description}"
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="size-20 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-200">
              <Icon icon="solar:tea-cup-bold-duotone" className="size-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-400">No breaks scheduled</h3>
              <p className="text-sm text-slate-400/60 font-medium">
                Your upcoming schedule is fully open.
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] gap-0 p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Icon icon="solar:tea-cup-linear" className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">
                  Schedule Break
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
                  Block your calendar for personal time
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-3">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Date
              </Label>
              <div className="relative">
                <Icon
                  icon="solar:calendar-linear"
                  className="absolute left-4 top-3.5 size-5 text-primary/50"
                />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="pl-11 h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-slate-700 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  From
                </Label>
                <div className="relative">
                  <Icon
                    icon="solar:clock-circle-linear"
                    className="absolute left-4 top-3.5 size-5 text-primary/50"
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-slate-700 focus-visible:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  To
                </Label>
                <div className="relative">
                  <Icon
                    icon="solar:clock-circle-linear"
                    className="absolute left-4 top-3.5 size-5 text-primary/50"
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-slate-700 focus-visible:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Reason / Note
              </Label>
              <Input
                placeholder="e.g. Lunch, Private Appointment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 rounded-xl border-slate-100 bg-slate-50 font-medium placeholder:text-slate-300 focus-visible:ring-primary/10"
              />
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
            <Button
              onClick={handleCreateBreak}
              disabled={loading}
              className="flex-1 rounded-xl h-12 bg-primary hover:bg-primary/95 text-white font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
            >
              Add Break to Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
