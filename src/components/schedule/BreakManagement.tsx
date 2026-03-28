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
    .filter((b) => {
      if (!b.date) return false;
      const d = new Date(b.date);
      return isValid(d) && !isBefore(d, startOfToday());
    })
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-6 border-b">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                Break Management
              </CardTitle>
              <CardDescription className="text-sm">
                Schedule personal time or lunch breaks.
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
              <Icon icon="solar:add-circle-linear" className="size-5" />
              Schedule Break
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcomingBreaks.length > 0 ? (
          upcomingBreaks.map((item) => (
            <Card
              key={item.id}
              className="group border shadow-sm rounded-xl overflow-hidden bg-background"
            >
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {item.date && isValid(new Date(item.date))
                          ? format(new Date(item.date), 'EEEE')
                          : '—'}
                      </p>
                      <h4 className="text-sm font-bold text-slate-800">
                        {item.date && isValid(new Date(item.date))
                          ? format(new Date(item.date), 'MMMM do, yyyy')
                          : '—'}
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBreak(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border">
                    <Icon icon="solar:clock-circle-bold" className="size-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-muted-foreground font-medium italic">
                      {item.description}
                    </p>
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
        <DialogContent className="theme-stylist w-[calc(100%-2rem)] sm:max-w-[420px] rounded-xl gap-0 p-0 border shadow-lg flex flex-col max-h-[95dvh] overflow-hidden">
          <DialogHeader className="p-6 border-b text-left">
            <DialogTitle className="text-xl font-bold text-foreground">Schedule Break</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Block your calendar for personal time
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  From
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  To
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Reason / Note
              </Label>
              <Input
                placeholder="Lunch, Break etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <DialogFooter className="p-6 border-t">
            <Button onClick={handleCreateBreak} disabled={loading} className="flex-1">
              Add Break
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
