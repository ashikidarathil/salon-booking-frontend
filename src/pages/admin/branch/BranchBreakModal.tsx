'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { updateBranch, fetchPaginatedBranches } from '@/features/branch/branch.thunks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Trash2, Plus, Clock } from 'lucide-react';
import { showSuccess, showError, showLoading, closeLoading } from '@/common/utils/swal.utils';

interface BranchBreakModalProps {
  branchId: string;
  branchName?: string;
  defaultBreaks?: Array<{ startTime: string; endTime: string; description: string }>;
  open: boolean;
  onClose: () => void;
}

export default function BranchBreakModal({
  branchId,
  branchName,
  defaultBreaks: initialBreaks,
  open,
  onClose,
}: BranchBreakModalProps) {
  const dispatch = useAppDispatch();
  const [breaks, setBreaks] = useState<
    Array<{ startTime: string; endTime: string; description: string }>
  >(initialBreaks || []);

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const calculateTotalMinutes = (breakList: typeof breaks) => {
    return breakList.reduce((total, b) => {
      return total + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
    }, 0);
  };

  const handleAddBreak = () => {
    setBreaks([...breaks, { startTime: '13:00', endTime: '14:00', description: 'New Break' }]);
  };

  const handleRemoveBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof (typeof breaks)[0], value: string) => {
    const newBreaks = [...breaks];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setBreaks(newBreaks);
  };

  const handleSave = async () => {
    // Validation
    const totalMinutes = calculateTotalMinutes(breaks);
    if (totalMinutes > 90) {
      showError(
        'Limit Exceeded',
        `Total break time cannot exceed 90 minutes. Currently ${totalMinutes} mins.`,
      );
      return;
    }

    for (const b of breaks) {
      if (timeToMinutes(b.endTime) <= timeToMinutes(b.startTime)) {
        showError('Invalid Time', `End time must be after start time for "${b.description}"`);
        return;
      }
    }

    showLoading('Saving default breaks...');
    const result = await dispatch(updateBranch({ id: branchId, data: { defaultBreaks: breaks } }));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', 'Default branch breaks updated');
      dispatch(fetchPaginatedBranches({ page: 1, limit: 10 })); // Refresh list to get updated data
      onClose();
    } else {
      showError('Failed', 'Could not save default breaks');
    }
  };

  const totalMins = calculateTotalMinutes(breaks);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="theme-admin max-w-2xl">
        <DialogHeader>
          <DialogTitle>Global Branch Breaks - {branchName}</DialogTitle>
          <DialogDescription>
            These breaks will automatically apply to all stylists in this branch. Maximum total
            duration allowed: 90 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-dashed">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-primary" />
              <span className="font-medium">Total Duration:</span>
              <span
                className={totalMins > 90 ? 'text-red-600 font-bold' : 'text-primary font-bold'}
              >
                {totalMins} / 90 mins
              </span>
            </div>
            <Button size="sm" onClick={handleAddBreak} className="gap-2">
              <Plus className="size-4" /> Add Break
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breaks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No global breaks defined.
                    </TableCell>
                  </TableRow>
                ) : (
                  breaks.map((b, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Input
                          value={b.description}
                          onChange={(e) => handleChange(i, 'description', e.target.value)}
                          placeholder="Lunch Break"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={b.startTime}
                          onChange={(e) => handleChange(i, 'startTime', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={b.endTime}
                          onChange={(e) => handleChange(i, 'endTime', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveBreak(i)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
