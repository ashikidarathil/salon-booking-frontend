'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { slotService } from '@/services/slot.service';
import { stylistBranchService } from '@/services/stylistBranch.service';
import type { Slot } from '@/services/slot.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '@/common/utils/swal.utils';

export default function StylistSlotManagementPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fetchedBranchId, setFetchedBranchId] = useState<string | null>(null);

  const branchId = user?.branchId || fetchedBranchId;

  // Fetch stylist's branch if not in user object
  useEffect(() => {
    const fetchStylistBranch = async () => {
      if (!user?.branchId && user?.id && user?.role === 'STYLIST') {
        try {
          const response = await stylistBranchService.getStylistBranches(user.id);
          const branches = response.data.data;
          if (branches.length > 0) {
            const activeBranch = branches.find((b: any) => b.isActive);
            const branchId = activeBranch?.branchId || branches[0].branchId;
            setFetchedBranchId(branchId);
          }
        } catch (error) {
          console.error('Failed to fetch stylist branch:', error);
        }
      }
    };
    fetchStylistBranch();
  }, [user?.branchId, user?.id, user?.role]);

  const fetchSlots = async () => {
    if (!branchId || !selectedDate) return;

    setLoading(true);
    try {
      const response = await slotService.getStylistSlots({
        branchId,
        date: selectedDate,
      });
      setSlots(response.data.data);
    } catch (error) {
      showError('Error', 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate, branchId]);

  const handleBlockToggle = async (slot: Slot) => {
    if (slot.status === 'BOOKED') {
      showError('Cannot block', 'This slot is already booked');
      return;
    }

    const action = slot.status === 'BLOCKED' ? 'unblock' : 'block';
    const confirmed = await showConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Slot?`,
      `Are you sure you want to ${action} this slot?`,
      'Yes',
      'Cancel'
    );

    if (confirmed) {
      showLoading(`${action}ing slot...`);
      try {
        if (slot.status === 'BLOCKED') {
          await slotService.unblockSlot(slot.id);
        } else {
          await slotService.blockSlot(slot.id, 'Stylist blocked');
        }
        showSuccess('Success', `Slot ${action}ed`);
        fetchSlots();
      } catch (error) {
        showError('Error', `Failed to ${action} slot`);
      } finally {
        closeLoading();
      }
    }
  };

  const getStatusBadge = (status: Slot['status']) => {
    const variants = {
      AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      BOOKED: 'bg-green-100 text-green-800 border-green-200',
      BLOCKED: 'bg-red-100 text-red-800 border-red-200',
      LOCKED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return <Badge className={`${variants[status]} border shadow-none capitalize`}>{status.toLowerCase()}</Badge>;
  };

  if (!branchId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Icon icon="solar:info-circle-bold" className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Branch Assigned</h3>
            <p className="text-muted-foreground">
              You need to be assigned to a branch to view and manage your slots.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">My Slots</h1>
        <p className="text-muted-foreground">View and manage your booking availability.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon icon="solar:calendar-bold" /> Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchSlots} disabled={loading}>
              <Icon icon="solar:restart-bold" className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Slots ({slots.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Loading slots...
                  </TableCell>
                </TableRow>
              ) : slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No slots found for the selected date.
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">
                      {slot.startTime} - {slot.endTime}
                    </TableCell>
                    <TableCell>{getStatusBadge(slot.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={slot.status === 'BLOCKED' ? 'outline' : 'destructive'}
                        className="h-8"
                        onClick={() => handleBlockToggle(slot)}
                        disabled={slot.status === 'BOOKED'}
                      >
                        {slot.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
