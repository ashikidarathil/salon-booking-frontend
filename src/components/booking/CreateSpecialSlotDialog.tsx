'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@iconify/react';
import { showSuccess, showApiError } from '@/common/utils/swal.utils';
import { slotService } from '@/services/slot.service';
import { format } from 'date-fns';

interface CreateSpecialSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  stylistId?: string;
  date?: string;
  suggestedStartTime?: string;
  onCreated?: () => void;
  isStylist?: boolean;
}

export function CreateSpecialSlotDialog({
  isOpen,
  onClose,
  branchId,
  stylistId,
  date,
  suggestedStartTime,
  onCreated,
  isStylist = false,
}: CreateSpecialSlotDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const [form, setForm] = useState({
    date: date || today,
    startTime: suggestedStartTime || '',
    endTime: '',
    note: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ date: date || today, startTime: suggestedStartTime || '', endTime: '', note: '' });
  }, [isOpen, date, suggestedStartTime, today]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!stylistId) {
      showApiError('No stylist selected.');
      return;
    }
    if (!form.startTime || !form.endTime) {
      showApiError('Please enter both start and end time.');
      return;
    }
    if (form.startTime >= form.endTime) {
      showApiError('End time must be after start time.');
      return;
    }

    setLoading(true);
    try {
      await slotService.createSpecialSlot({
        stylistId,
        branchId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        note: form.note.trim() || undefined,
      });

      showSuccess('Special Slot Created', `Slot added for ${form.startTime} – ${form.endTime}`);
      onCreated?.();
      onClose();
    } catch (err: unknown) {
      showApiError(err, 'Failed to create special slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[420px] ${isStylist ? 'theme-stylist' : 'theme-admin'}`}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Create Special Slot</DialogTitle>
          <DialogDescription className="sr-only">Add a manual slot for a specific stylist and date.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Internal Note <span className="font-normal">(Why this slot?)</span>
            </Label>
            <Textarea
              placeholder="e.g. For VIP client or wait period"
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="resize-none h-20 text-sm focus-visible:ring-primary"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={form.date}
              min={today}
              onChange={(e) => handleChange('date', e.target.value)}
              className="focus-visible:ring-primary"
            />
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Start Time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">End Time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading || !form.startTime || !form.endTime}
            >
              {loading ? (
                <>
                  <Icon icon="eos-icons:loading" className="mr-2 animate-spin size-4" />
                  Creating...
                </>
              ) : (
                'Create Slot'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
