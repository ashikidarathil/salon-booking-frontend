'use client';

import { useEffect, useState, useCallback } from 'react';
import { branchService } from '@/services/branch.service';
import { stylistInviteService } from '@/services/stylistInvite.service';
import { slotService } from '@/services/slot.service';
import type { SlotItem } from '@/features/slot/slot.types';
import { CreateSpecialSlotDialog } from '@/components/booking/CreateSpecialSlotDialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { Branch } from '@/features/branch/branch.types';
import type { StylistListItem } from '@/features/stylistInvite/stylistInvite.types';

export default function SlotManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stylists, setStylists] = useState<StylistListItem[]>([]);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [specialSlots, setSpecialSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    branchId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    stylistId: 'all',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [specialSlotOpen, setSpecialSlotOpen] = useState(false);
  const [slotView, setSlotView] = useState<'normal' | 'special'>('normal');

  useEffect(() => {
    const init = async () => {
      try {
        const response = await branchService.list();
        setBranches(response.data.data);
        if (response.data.data.length > 0) {
          setFilters((prev) => ({ ...prev, branchId: response.data.data[0].id }));
        }
      } catch (error) {
        showApiError(error, 'Failed to load branches');
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchBranchStylists = async () => {
      if (!filters.branchId) return;
      try {
        const response = await stylistInviteService.getPublicStylists({
          branchId: filters.branchId,
          limit: 100,
        });
        setStylists(response.data.data.data);
      } catch (error) {
        console.error('Failed to fetch stylists for branch:', error);
      }
    };
    fetchBranchStylists();
  }, [filters.branchId]);

  const filteredStylists = stylists.filter((s) =>
    (s.name || s.email || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const fetchSlots = useCallback(async () => {
    if (!filters.branchId || !filters.date) return;

    setLoading(true);
    try {
      const params = {
        branchId: filters.branchId,
        date: filters.date,
        stylistId: filters.stylistId === 'all' ? undefined : filters.stylistId,
      };
      const response = await slotService.adminListSlots(params);
      setSlots(response.data.data);
    } catch (error) {
      showApiError(error, 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  }, [filters.branchId, filters.date, filters.stylistId]);

  const fetchSpecialSlots = useCallback(async () => {
    if (!filters.branchId || !filters.date) return;
    setLoading(true);
    try {
      const response = await slotService.listSpecialSlots({
        branchId: filters.branchId,
        date: filters.date,
        stylistId: filters.stylistId === 'all' ? undefined : filters.stylistId,
      });
      setSpecialSlots(response.data.data);
    } catch (error) {
      showApiError(error, 'Failed to fetch special slots');
    } finally {
      setLoading(false);
    }
  }, [filters.branchId, filters.date, filters.stylistId]);

  useEffect(() => {
    if (filters.branchId && filters.date) {
      if (slotView === 'normal') fetchSlots();
      else fetchSpecialSlots();
    }
  }, [filters.branchId, filters.date, slotView, fetchSlots, fetchSpecialSlots]);

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
      const reason = await showBlockConfirm();
      if (reason) {
        showLoading('Blocking slot...');
        try {
          await slotService.blockSlot(slot.id, reason);
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
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      BOOKED: 'bg-blue-100 text-blue-800 border-blue-200',
      BLOCKED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
      BREAK: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      OFF_DAY: 'bg-purple-100 text-purple-800 border-purple-200',
      NON_WORKING: 'bg-gray-100 text-gray-800 border-gray-200',
      NO_SCHEDULE: 'bg-orange-100 text-orange-800 border-orange-200',
      HOLIDAY: 'bg-red-50 text-red-700 border-red-100',
    };
    const label =
      status === 'AVAILABLE' && type === 'special'
        ? 'Special (Available)'
        : status.replace('_', ' ').toLowerCase();
    return (
      <Badge
        variant="outline"
        className={`${variants[status] ?? 'bg-muted text-muted-foreground border-muted'} border shadow-none capitalize whitespace-nowrap`}
      >
        {label}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Slot Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage booking slots across all branches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Input
              placeholder="Search stylists..."
              className="w-full h-10 pl-10 transition-all duration-200 md:w-64 rounded-xl border-muted bg-white/50 backdrop-blur-sm focus:md:w-72 focus:shadow-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Special Slot Dialog */}
      {specialSlotOpen && filters.branchId && filters.stylistId !== 'all' && (
        <CreateSpecialSlotDialog
          isOpen={specialSlotOpen}
          onClose={() => setSpecialSlotOpen(false)}
          branchId={filters.branchId}
          stylistId={filters.stylistId}
          date={filters.date}
          onCreated={() => {
            if (slotView === 'normal') fetchSlots();
            else fetchSpecialSlots();
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon icon="solar:filter-bold" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Branch</label>
            <Select
              value={filters.branchId}
              onValueChange={(val) => setFilters((prev) => ({ ...prev, branchId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stylist</label>
            <Select
              value={filters.stylistId}
              onValueChange={(val) => setFilters((prev) => ({ ...prev, stylistId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Stylists" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stylists</SelectItem>
                {filteredStylists.map((s) => (
                  <SelectItem key={s.userId} value={s.userId}>
                    {s.name || s.email}
                  </SelectItem>
                ))}
                {filteredStylists.length === 0 && (
                  <p className="p-2 text-xs text-center text-muted-foreground">No stylists found</p>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>
              Available Slots (
              {
                slots.filter((s) => !['OFF_DAY', 'NON_WORKING', 'HOLIDAY'].includes(s.status))
                  .length
              }
              )
            </CardTitle>
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
                    ? 'bg-background shadow text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Special
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {slotView === 'special' && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-primary/30 text-primary hover:bg-primary/5 gap-1.5 font-semibold"
                onClick={() => setSpecialSlotOpen(true)}
                disabled={!filters.branchId || filters.stylistId === 'all'}
              >
                <Icon icon="solar:add-square-bold" className="size-3.5" />
                Create Special Slot
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={slotView === 'special' ? fetchSpecialSlots : fetchSlots}
              disabled={loading}
            >
              <Icon icon="solar:restart-bold" className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {slotView === 'normal' ? (
            // ─── Normal Slots ───
            <>
              {filters.stylistId !== 'all' && slots.find((s) => s.status === 'OFF_DAY') ? (
                <div className="p-8 text-center border-t">
                  <div className="inline-flex items-center justify-center mb-4 text-purple-600 border border-purple-100 rounded-full size-16 bg-purple-50">
                    <Icon icon="solar:tea-cup-bold" className="size-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">Stylist is on Leave</h3>
                  <p className="max-w-sm mx-auto text-muted-foreground">
                    No slots are available for today because this stylist has an approved off-day
                    request.
                  </p>
                </div>
              ) : filters.stylistId !== 'all' && slots.find((s) => s.status === 'NON_WORKING') ? (
                <div className="p-8 text-center border-t">
                  <div className="inline-flex items-center justify-center mb-4 border rounded-full size-16 bg-slate-50 text-slate-400 border-slate-100">
                    <Icon icon="solar:calendar-minimalistic-bold" className="size-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">Not a Working Day</h3>
                  <p className="max-w-sm mx-auto text-muted-foreground">
                    This stylist is not scheduled to work on this day according to their weekly
                    schedule.
                  </p>
                </div>
              ) : filters.stylistId !== 'all' && slots.find((s) => s.status === 'NO_SCHEDULE') ? (
                <div className="p-8 text-center border-t">
                  <div className="inline-flex items-center justify-center mb-4 text-orange-600 border border-orange-100 rounded-full size-16 bg-orange-50">
                    <Icon icon="solar:shield-warning-bold" className="size-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">No Schedule Configured</h3>
                  <p className="max-w-sm mx-auto text-muted-foreground">
                    This stylist has not been assigned a weekly schedule yet. You can configure it
                    in the Stylist Management section.
                  </p>
                </div>
              ) : slots.find((s) => s.status === 'HOLIDAY') ? (
                <div className="p-8 text-center border-t">
                  <div className="inline-flex items-center justify-center mb-4 text-red-600 border border-red-100 rounded-full size-16 bg-red-50">
                    <Icon icon="solar:calendar-minimalistic-broken" className="size-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">Salon Holiday</h3>
                  <p className="max-w-sm mx-auto text-muted-foreground">
                    {slots.find((s) => s.status === 'HOLIDAY')?.note ||
                      'This day is marked as a holiday. No slots are available.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Stylist</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          Loading slots...
                        </TableCell>
                      </TableRow>
                    ) : slots.filter(
                        (slot) =>
                          !['OFF_DAY', 'NON_WORKING', 'NO_SCHEDULE', 'HOLIDAY', 'SPECIAL'].includes(
                            slot.status,
                          ),
                      ).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          No slots found for the selected criteria.
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
                                    Note: {slot.note}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{slot.stylistName || 'Unknown'}</span>
                                <span className="text-xs text-muted-foreground">
                                  {slot.stylistEmail}
                                </span>
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
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Icon icon="eos-icons:loading" className="size-5 animate-spin" />
                  <span>Loading special slots...</span>
                </div>
              ) : specialSlots.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                  <div className="flex items-center justify-center mb-3 border rounded-full size-16 bg-primary/10 border-primary/20">
                    <Icon icon="solar:add-square-bold" className="size-8 text-primary/60" />
                  </div>
                  <p className="font-medium text-slate-700">No special slots for this date</p>
                  <p className="mt-1 text-sm">
                    Select a specific stylist and create a special slot.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {specialSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 border rounded-xl border-primary/20 bg-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-full size-10 bg-primary/20">
                          <Icon icon="solar:add-square-bold" className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {slot.startTime} – {slot.endTime}
                          </p>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <p className="text-xs font-medium text-slate-700">
                              {slot.stylistName || 'Stylist'}
                            </p>
                            <div className="flex items-center gap-2">
                              {slot.note && (
                                <p className="text-[10px] text-muted-foreground italic">
                                  “{slot.note}”
                                </p>
                              )}
                            </div>
                            {slot.bookedServices && slot.bookedServices.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {slot.bookedServices.map((svc, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium"
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
                            className="w-8 h-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
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
