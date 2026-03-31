import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBreaks, createBreak, deleteBreak } from '@/features/schedule/schedule.thunks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { format, isBefore, isValid, startOfToday } from 'date-fns';

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
    .filter((b) => {
      if (!b.date) return false;
      const d = new Date(b.date);
      return isValid(d) && !isBefore(d, startOfToday());
    })
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="pb-6 bg-muted/30 border-b border-border/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2.5 text-foreground">
                <div className="size-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Icon icon="solar:tea-cup-bold-duotone" className="size-6 text-primary/80" />
                </div>
                Break Management
              </CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground/50 mt-1 ml-12">
                Schedule personal time or lunch breaks to block your calendar.
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="h-10 px-6 rounded-2xl bg-primary text-white font-semibold text-xs shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
              <Icon icon="solar:add-circle-bold-duotone" className="size-4 mr-2" />
              Schedule Break
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBreaks.length > 0 ? (
              upcomingBreaks.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col p-6 rounded-3xl border border-border/40 bg-background transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                     <div className="size-12 rounded-2xl bg-muted/20 flex flex-col items-center justify-center border border-border/5">
                        <span className="text-[10px] font-bold text-primary/70 uppercase leading-none">{item.date ? format(new Date(item.date), 'MMM') : ''}</span>
                        <span className="text-sm font-bold text-foreground">{item.date ? format(new Date(item.date), 'dd') : ''}</span>
                     </div>
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBreak(item.id)}
                        className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="size-4" />
                      </Button>
                  </div>

                  <div className="space-y-1 mb-4">
                     <h4 className="text-base font-bold text-foreground tracking-tight">
                        {item.date ? format(new Date(item.date), 'EEEE, MMMM do') : '—'}
                     </h4>
                     <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider leading-none">
                        Scheduled Break
                     </p>
                  </div>

                  <div className="flex flex-col gap-3">
                     <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/[0.02] border border-primary/5">
                        <Icon icon="solar:clock-circle-bold-duotone" className="size-5 text-primary/80" />
                        <span className="text-sm font-bold text-primary/80 tracking-tight">
                          {item.startTime} - {item.endTime}
                        </span>
                     </div>

                     {item.description && (
                        <div className="flex items-center gap-2 px-3 py-1">
                           <div className="size-1.5 rounded-full bg-primary/40 shrink-0" />
                           <p className="text-xs text-muted-foreground font-semibold italic truncate">
                              {item.description}
                           </p>
                        </div>
                     )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6 bg-muted/10 rounded-[3rem] border border-dashed border-border/40">
                <div className="size-24 rounded-[2.5rem] bg-background shadow-xl flex items-center justify-center text-muted-foreground/10 border border-border/5">
                  <Icon icon="solar:tea-cup-bold-duotone" className="size-12" />
                </div>
                <div className="space-y-2 max-w-sm px-6">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Fully Available</h3>
                  <p className="text-sm text-muted-foreground/50 font-medium">
                    You haven't scheduled any breaks yet. Your calendar is wide open for bookings!
                  </p>
                </div>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="rounded-2xl font-semibold text-xs h-10 px-6">
                  Quick Schedule
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl gap-0 p-0 border-none shadow-2xl overflow-hidden theme-stylist">
          <div className="bg-primary/5 p-8 border-b border-primary/10">
             <DialogHeader className="p-0 text-left">
                <DialogTitle className="text-2xl font-bold text-primary tracking-tight">Schedule Break</DialogTitle>
                <DialogDescription className="text-sm font-medium text-primary/40">
                  Block your calendar for personal time
                </DialogDescription>
              </DialogHeader>
          </div>

          <div className="p-8 space-y-8 bg-background">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pl-1">
                 <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center">
                    <Icon icon="solar:calendar-bold-duotone" className="size-4 text-primary/70" />
                 </div>
                 <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Target Date
                 </Label>
              </div>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="h-12 rounded-2xl border-border/40 bg-muted/5 px-4 font-semibold text-sm focus-visible:ring-primary/10"
              />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                   <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Icon icon="solar:clock-circle-bold-duotone" className="size-4 text-primary/70" />
                   </div>
                   <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Break Interval
                   </Label>
                </div>
                <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl border border-border/20 bg-muted/5">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-wider pl-1">
                      Start Time
                    </Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-11 rounded-xl border-none bg-background shadow-inner font-semibold text-sm focus-visible:ring-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-wider pl-1">
                      End Time
                    </Label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-11 rounded-xl border-none bg-background shadow-inner font-semibold text-sm focus-visible:ring-primary/10"
                    />
                  </div>
                </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2 pl-1">
                 <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center">
                    <Icon icon="solar:notes-bold-duotone" className="size-4 text-primary/70" />
                 </div>
                 <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                   Reason / Note
                 </Label>
               </div>
               <Input
                placeholder="e.g. Lunch, Doctor Visit, Team Meeting"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 rounded-2xl border-border/40 bg-muted/5 px-4 font-semibold text-sm focus-visible:ring-primary/10"
              />
            </div>
          </div>

          <div className="p-8 pt-4 bg-background">
            <Button onClick={handleCreateBreak} disabled={loading} className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
               Confirm Break Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
