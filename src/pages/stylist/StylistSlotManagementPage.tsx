'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';
import { slotService } from '@/services/slot.service';
import { stylistBranchService } from '@/services/stylistBranch.service';
import type { SlotItem } from '@/features/slot/slot.types';
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
import {
  showSuccess,
  showError,
  showApiError,
  showBlockConfirm,
  showUnblockConfirm,
  showLoading,
  closeLoading,
} from '@/common/utils/swal.utils';
import { CreateSpecialSlotDialog } from '@/components/booking/CreateSpecialSlotDialog';

export default function StylistSlotManagementPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [specialSlots, setSpecialSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fetchedBranchId, setFetchedBranchId] = useState<string | null>(null);
  const [slotView, setSlotView] = useState<'normal' | 'special'>('normal');
  const [specialSlotOpen, setSpecialSlotOpen] = useState(false);

  const branchId = user?.branchId || fetchedBranchId;
  const stylistId = user?.id;

  // Fetch stylist's branch if not in user object
  useEffect(() => {
    const fetchStylistBranch = async () => {
      if (!user?.branchId && user?.id && user?.role === 'STYLIST') {
        try {
          const response = await stylistBranchService.getStylistBranches(user.id);
          const branches = response.data.data;
          if (branches.length > 0) {
            const activeBranch = branches.find((b) => b.isActive);
            const bId = activeBranch?.branchId || branches[0].branchId;
            setFetchedBranchId(bId);
          }
        } catch (error) {
          console.error('Failed to fetch stylist branch:', error);
        }
      }
    };
    fetchStylistBranch();
  }, [user?.branchId, user?.id, user?.role]);

  const fetchSlots = useCallback(async () => {
    if (!branchId || !selectedDate) return;

    setLoading(true);
    try {
      const response = await slotService.getStylistSlots({
        branchId,
        date: selectedDate,
      });
      setSlots(response.data.data);
    } catch (error) {
      showApiError(error, 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  }, [branchId, selectedDate]);

  const fetchSpecialSlots = useCallback(async () => {
    if (!branchId || !stylistId || !selectedDate) return;
    setLoading(true);
    try {
      const response = await slotService.listSpecialSlots({
        branchId,
        stylistId,
        date: selectedDate,
      });
      setSpecialSlots(response.data.data);
    } catch (error) {
      showApiError(error, 'Failed to fetch special slots');
    } finally {
      setLoading(false);
    }
  }, [branchId, stylistId, selectedDate]);

  useEffect(() => {
    if (slotView === 'normal') fetchSlots();
    else fetchSpecialSlots();
  }, [fetchSlots, fetchSpecialSlots, slotView]);

  const handleBlockToggle = async (slot: SlotItem) => {
    if (slot.status === 'BOOKED') {
      showError('Cannot block', 'This slot is already booked');
      return;
    }

    if (slot.status === 'BLOCKED') {
      const confirmed = await showUnblockConfirm();
      if (confirmed) {
        showLoading('Unblocking slot...');
        try {
          await slotService.unblockSlot(slot.id);
          closeLoading();
          showSuccess('Success', 'Slot unblocked');
          fetchSlots();
        } catch (error) {
          closeLoading();
          showApiError(error, 'Failed to unblock slot');
        }
      }
    } else {
      const reason = await showBlockConfirm('Block Slot?', 'Please provide a reason for blocking.');
      if (reason) {
        showLoading('Blocking slot...');
        try {
          await slotService.blockSlot(slot.id, reason || 'Stylist blocked');
          closeLoading();
          showSuccess('Success', 'Slot blocked');
          fetchSlots();
        } catch (error) {
          closeLoading();
          showApiError(error, 'Failed to block slot');
        }
      }
    }
  };

  const handleCancelSpecialSlot = async (slotId: string) => {
    const confirmed = await showUnblockConfirm(
      'Cancel Special Slot?',
      'Are you sure you want to cancel this special slot?',
    );
    if (!confirmed) return;

    showLoading('Cancelling special slot...');
    try {
      // Slot ID is prefixed with special_ in the DTO, strip it if necessary or ensure service handles it
      // The service expects the raw mongoId
      const id = slotId.startsWith('special_') ? slotId.replace('special_', '') : slotId;
      await slotService.cancelSpecialSlot(id);
      closeLoading();
      showSuccess('Success', 'Special slot cancelled');
      fetchSpecialSlots();
    } catch (error) {
      closeLoading();
      showApiError(error, 'Failed to cancel special slot');
    }
  };

  const getStatusBadge = (status: SlotItem['status'], type: 'normal' | 'special' = 'normal') => {
    const variants: Record<string, string> = {
      AVAILABLE:
        type === 'special'
          ? 'bg-violet-50 text-violet-700 border-violet-100'
          : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      BOOKED: 'bg-blue-100 text-blue-800 border-blue-200',
      BLOCKED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
      LOCKED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      BREAK: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      NON_WORKING: 'bg-gray-100 text-gray-800 border-gray-200',
      NO_SCHEDULE: 'bg-orange-100 text-orange-800 border-orange-200',
      HOLIDAY: 'bg-red-50 text-red-700 border-red-100',
    };
    const label =
      status === 'AVAILABLE' && type === 'special'
        ? '⚡ Special (Available)'
        : status.replace('_', ' ').toLowerCase();
    return (
      <Badge
        variant="outline"
        className={`${variants[status]} border shadow-none capitalize whitespace-nowrap`}
      >
        {label}
      </Badge>
    );
  };

  if (!branchId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Icon
              icon="solar:info-circle-bold"
              className="size-12 mx-auto mb-4 text-muted-foreground"
            />
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Slots</h1>
          <p className="text-muted-foreground">View and manage your booking availability.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-9 border-blue-300 text-blue-700 hover:bg-blue-50 gap-2 font-semibold shadow-sm"
          onClick={() => setSpecialSlotOpen(true)}
          disabled={!branchId || !stylistId}
        >
          <Icon icon="solar:add-square-bold" className="size-4" />
          Create Special Slot
        </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={slotView === 'normal' ? fetchSlots : fetchSpecialSlots}
              disabled={loading}
            >
              <Icon icon="solar:restart-bold" className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Special Slot Dialog */}
      {specialSlotOpen && branchId && stylistId && (
        <CreateSpecialSlotDialog
          isOpen={specialSlotOpen}
          onClose={() => setSpecialSlotOpen(false)}
          branchId={branchId}
          stylistId={stylistId}
          date={selectedDate}
          onCreated={fetchSpecialSlots}
          isStylist={true}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Your Slots</CardTitle>
            {/* Normal / Special toggle */}
            <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => setSlotView('normal')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  slotView === 'normal'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setSlotView('special')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  slotView === 'special'
                    ? 'bg-background shadow text-violet-700'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Special
              </button>
            </div>
          </div>

        </CardHeader>
        <CardContent className="p-0">
          {slotView === 'normal' ? (
            // ─── Normal Slots ───
            <>
              {slots.find((s) => s.status === 'OFF_DAY') ? (
                <div className="p-8 text-center border-t">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-purple-50 text-purple-600 mb-4 border border-purple-100">
                    <Icon icon="solar:tea-cup-bold" className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">You are on Leave</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    No slots are available for today because you have an approved off-day request.
                  </p>
                </div>
              ) : slots.find((s) => s.status === 'NON_WORKING') ? (
                <div className="p-8 text-center border-t">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
                    <Icon icon="solar:calendar-minimalistic-bold" className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Not a Working Day</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    You are not scheduled to work on this day. Please check your weekly schedule.
                  </p>
                </div>
              ) : slots.find((s) => s.status === 'NO_SCHEDULE') ? (
                <div className="p-8 text-center border-t">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-orange-50 text-orange-600 mb-4 border border-orange-100">
                    <Icon icon="solar:shield-warning-bold" className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Schedule Not Configured</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Your weekly schedule has not been set up yet. Please contact your manager to
                    configure your working hours.
                  </p>
                </div>
              ) : slots.find((s) => s.status === 'HOLIDAY') ? (
                <div className="p-8 text-center border-t">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-red-50 text-red-600 mb-4 border border-red-100">
                    <Icon icon="solar:calendar-minimalistic-broken" className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Salon Holiday</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {slots.find((s) => s.status === 'HOLIDAY')?.note ||
                      'The salon is closed today for a holiday.'}
                  </p>
                </div>
              ) : (
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
                    ) : slots.filter(
                        (s) =>
                          !['OFF_DAY', 'NON_WORKING', 'NO_SCHEDULE', 'HOLIDAY', 'SPECIAL'].includes(
                            s.status,
                          ),
                      ).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No slots found for the selected date.
                        </TableCell>
                      </TableRow>
                    ) : (
                      slots
                        .filter(
                          (slot) =>
                            ![
                              'OFF_DAY',
                              'NON_WORKING',
                              'NO_SCHEDULE',
                              'HOLIDAY',
                              'SPECIAL',
                            ].includes(slot.status),
                        )
                        .map((slot) => (
                          <TableRow key={slot.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                {slot.note && (
                                  <span className="text-[10px] text-red-600 font-medium italic mt-0.5">
                                    Reason: {slot.note}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(slot.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={slot.status === 'BLOCKED' ? 'outline' : 'destructive'}
                                className="h-8"
                                onClick={() => handleBlockToggle(slot)}
                                disabled={!['AVAILABLE', 'BLOCKED'].includes(slot.status)}
                              >
                                {slot.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              )}
            </>
          ) : (
            // ─── Special Slots ───
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                  <Icon icon="eos-icons:loading" className="size-5 animate-spin" />
                  <span>Loading special slots...</span>
                </div>
              ) : specialSlots.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                  <div className="size-16 rounded-full bg-violet-50 flex items-center justify-center mb-3 border border-violet-100">
                    <Icon icon="solar:add-square-bold" className="size-8 text-violet-400" />
                  </div>
                  <p className="font-medium text-slate-700">No special slots for this date</p>
                  <p className="text-sm mt-1">
                    Create a special slot to serve a customer during a wait period.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {specialSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-violet-200 bg-violet-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-violet-100 flex items-center justify-center">
                          <Icon icon="solar:add-square-bold" className="size-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {slot.startTime} – {slot.endTime}
                          </p>
                          <div className="space-y-1 mt-1">
                            {slot.note && (
                              <p className="text-xs text-muted-foreground italic">“{slot.note}”</p>
                            )}
                            {slot.bookedServices && slot.bookedServices.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {slot.bookedServices.map((svc, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium"
                                  >
                                    {svc}
                                  </span>
                                ))}
                              </div>
                            ) : slot.status === 'BOOKED' ? (
                              <p className="text-[10px] text-muted-foreground italic">
                                User services loading...
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(slot.status, 'special')}
                        {slot.status === 'AVAILABLE' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleCancelSpecialSlot(slot.id)}
                          >
                            <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
