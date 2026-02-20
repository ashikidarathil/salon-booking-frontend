'use client';

import { useEffect, useState } from 'react';
import { branchService } from '@/services/branch.service';
import { stylistInviteService } from '@/services/stylistInvite.service';
import { slotService } from '@/services/slot.service';
import type { Slot } from '@/services/slot.service';
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
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '@/common/utils/swal.utils';
import type { Branch } from '@/features/branch/branch.types';
import type { StylistListItem } from '@/features/stylistInvite/stylistInvite.types';

export default function SlotManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stylists, setStylists] = useState<StylistListItem[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    branchId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    stylistId: 'all',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [branchRes, stylistRes] = await Promise.all([
          branchService.list(),
          stylistInviteService.listStylists(),
        ]);
        setBranches(branchRes.data.data);
        setStylists(stylistRes.data.data.filter(s => s.status === 'ACTIVE'));
        
        if (branchRes.data.data.length > 0) {
          setFilters(prev => ({ ...prev, branchId: branchRes.data.data[0].id }));
        }
      } catch (error) {
        showError('Error', 'Failed to load initial data');
      }
    };
    init();
  }, []);

  const fetchSlots = async () => {
    if (!filters.branchId || !filters.date) return;
    
    setLoading(true);
    try {
      const params = {
        branchId: filters.branchId,
        date: filters.date,
        stylistId: filters.stylistId === 'all' ? undefined : filters.stylistId,
      };
      const response = await slotService.listAvailableSlots(params);
      setSlots(response.data.data);
    } catch (error) {
      showError('Error', 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (filters.branchId && filters.date) {
      fetchSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.branchId, filters.date, filters.stylistId]);

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
          await slotService.blockSlot(slot.id, 'Admin blocked');
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
      AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
      BOOKED: 'bg-blue-100 text-blue-800 border-blue-200',
      BLOCKED: 'bg-red-100 text-red-800 border-red-200',
      LOCKED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return <Badge className={`${variants[status]} border shadow-none capitalize`}>{status.toLowerCase()}</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Slot Management</h1>
        <p className="text-muted-foreground">Monitor and manage booking slots across all branches.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon icon="solar:filter-bold" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Branch</label>
            <Select
              value={filters.branchId}
              onValueChange={(val) => setFilters(prev => ({ ...prev, branchId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stylist</label>
            <Select
              value={filters.stylistId}
              onValueChange={(val) => setFilters(prev => ({ ...prev, stylistId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Stylists" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stylists</SelectItem>
                {stylists.map(s => (
                  <SelectItem key={s.userId} value={s.userId}>{s.name || s.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Available Slots ({slots.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSlots} disabled={loading}>
              <Icon icon="solar:restart-bold" className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading slots...
                  </TableCell>
                </TableRow>
              ) : slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No slots found for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                slots.map(slot => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">
                      {slot.startTime} - {slot.endTime}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{slot.stylistName || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{slot.stylistEmail}</span>
                      </div>
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
