'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  upsertBranchService,
  toggleBranchServiceStatus,
  fetchBranchServicesPaginated,
} from '@/features/branchService/branchService.thunks';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
  closeLoading,
} from '@/common/utils/swal.utils';
import { Label } from '@/components/ui/label';
import type { BranchServiceItem } from '@/features/branchService/branchService.types';
import Pagination from '@/components/pagination/Pagination';

interface BranchServiceModalProps {
  branchId: string;
  branchName?: string;
  open: boolean;
  onClose: () => void;
}
const ITEMS_PER_PAGE = 5;

export default function BranchServiceModal({
  branchId,
  branchName,
  open,
  onClose,
}: BranchServiceModalProps) {
  const dispatch = useAppDispatch();
  const { services, loading, pagination } = useAppSelector((state) => state.branchService);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterConfigured, setFilterConfigured] = useState<'all' | 'configured' | 'notConfigured'>(
    'all',
  );
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingService, setEditingService] = useState<BranchServiceItem | null>(null);
  const [editPrice, setEditPrice] = useState<string>('0');
  const [editDuration, setEditDuration] = useState<string>('0');
  useEffect(() => {
    if (open && branchId) {
      dispatch(
        fetchBranchServicesPaginated({
          branchId,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          configured: filterConfigured === 'all' ? undefined : filterConfigured === 'configured',
          isActive: filterActive === 'all' ? undefined : filterActive === 'active',
        }),
      );
    }
  }, [open, branchId, dispatch, currentPage, search, filterConfigured, filterActive]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleConfiguredFilterChange = (value: string) => {
    setFilterConfigured(value as 'all' | 'configured' | 'notConfigured');
    setCurrentPage(1);
  };

  const handleActiveFilterChange = (value: string) => {
    setFilterActive(value as 'all' | 'active' | 'inactive');
    setCurrentPage(1);
  };

  const handleEdit = (service: BranchServiceItem) => {
    setEditingService(service);
    setEditPrice(service.price?.toString() || '0');
    setEditDuration(service.duration?.toString() || '0');
  };

  const handleSaveEdit = async (serviceId: string, serviceName: string) => {
    const priceNum = Number(editPrice);
    const durationNum = Number(editDuration);

    if (priceNum <= 0 || durationNum <= 0) {
      showError('Invalid values', 'Price and duration must be greater than 0');
      return;
    }

    showLoading('Updating service...');
    const result = await dispatch(
      upsertBranchService({
        branchId,
        serviceId,
        price: priceNum,
        duration: durationNum,
        isActive: true,
      }),
    );
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Updated', `${serviceName} updated successfully`);
      setEditingService(null);
      dispatch(
        fetchBranchServicesPaginated({
          branchId,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          configured: filterConfigured === 'all' ? undefined : filterConfigured === 'configured',
          isActive: filterActive === 'all' ? undefined : filterActive === 'active',
        }),
      );
    } else {
      showError('Failed', 'Could not update service');
    }
  };

  const handleToggleClick = async (
    serviceId: string,
    currentActive: boolean,
    serviceName: string,
    price: number | null,
    duration: number | null,
  ) => {
    const newActive = !currentActive;
    const action = newActive ? 'Enable' : 'Disable';

    if (!currentActive && (!price || !duration)) {
      showError(
        'Service not configured',
        'Please set price and duration before enabling this service.',
      );
      return;
    }

    const confirmed = await showConfirm(
      `${action} Service?`,
      `${action} ${serviceName} for this branch?`,
      action,
      'Cancel',
      newActive ? '#10B981' : '#ef4444',
    );

    if (!confirmed) return;

    const isEnable = newActive;

    showLoading(`${isEnable ? 'Enabling' : 'Disabling'}...`);
    const result = await dispatch(
      toggleBranchServiceStatus({
        branchId,
        serviceId,
        isActive: isEnable,
      }),
    );
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', `${serviceName} ${isEnable ? 'enabled' : 'disabled'}`);
      dispatch(
        fetchBranchServicesPaginated({
          branchId,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          configured: filterConfigured === 'all' ? undefined : filterConfigured === 'configured',
          isActive: filterActive === 'all' ? undefined : filterActive === 'active',
        }),
      );
    } else {
      showError('Failed', 'Could not update status');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setSearch('');
          setCurrentPage(1);
          setFilterConfigured('all');
          setFilterActive('all');
          setEditingService(null);
          onClose();
        }
      }}
    >
      <DialogContent className="theme-admin max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Services - {branchName || `Branch ${branchId}`}</DialogTitle>
          <DialogDescription>
            Update price, duration, and status for services at this branch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search-services" className="text-sm font-medium">
                Search Services
              </Label>
              <Input
                id="search-services"
                placeholder="Search by service name or category..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="filter-configured" className="text-sm font-medium">
                  Filter by Configuration
                </Label>
                <Select value={filterConfigured} onValueChange={handleConfiguredFilterChange}>
                  <SelectTrigger id="filter-configured" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[2000] bg-white">
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="configured">Configured Only</SelectItem>
                    <SelectItem value="notConfigured">Not Configured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-active" className="text-sm font-medium">
                  Filter by Status
                </Label>
                <Select value={filterActive} onValueChange={handleActiveFilterChange}>
                  <SelectTrigger id="filter-active" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[2000] bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Disabled Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="py-8 text-center border rounded-lg text-muted-foreground bg-muted/30">
              {search || filterConfigured !== 'all' || filterActive !== 'all'
                ? 'No services match your filters.'
                : 'No services available for this branch.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Duration (min)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((svc) => (
                      <TableRow key={svc.serviceId}>
                        <TableCell className="font-medium">{svc.name}</TableCell>
                        <TableCell>{svc.categoryName || '—'}</TableCell>
                        <TableCell>
                          {editingService?.serviceId === svc.serviceId ? (
                            <Input
                              type="number"
                              value={editPrice}
                              onChange={(e) => {
                                let val = e.target.value;
                                if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                  val = val.substring(1);
                                }
                                setEditPrice(val);
                              }}
                              className="w-24"
                              min="0"
                              step="0.01"
                            />
                          ) : svc.price === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            `₹${svc.price.toLocaleString('en-IN')}`
                          )}
                        </TableCell>
                        <TableCell>
                          {editingService?.serviceId === svc.serviceId ? (
                            <Input
                              type="number"
                              value={editDuration}
                              onChange={(e) => {
                                let val = e.target.value;
                                if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                  val = val.substring(1);
                                }
                                setEditDuration(val);
                              }}
                              className="w-24"
                              min="1"
                            />
                          ) : svc.duration === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            `${svc.duration} min`
                          )}
                        </TableCell>
                        <TableCell>
                          {!svc.configured ? (
                            <Badge
                              variant="outline"
                              className="text-yellow-700 border-yellow-200 bg-yellow-50"
                            >
                              Not Configured
                            </Badge>
                          ) : (
                            <Badge variant={svc.isActive ? 'default' : 'destructive'}>
                              {svc.isActive ? 'Active' : 'Disabled'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          {editingService?.serviceId === svc.serviceId ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(svc.serviceId, svc.name)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingService(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(svc)}>
                                {svc.configured ? 'Edit' : 'Configure'}
                              </Button>
                              <Button
                                variant={svc.isActive ? 'destructive' : 'default'}
                                size="sm"
                                disabled={!svc.configured}
                                onClick={() =>
                                  handleToggleClick(
                                    svc.serviceId,
                                    svc.isActive,
                                    svc.name,
                                    svc.price,
                                    svc.duration,
                                  )
                                }
                              >
                                {svc.isActive ? 'Disable' : 'Enable'}
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* ✅ NEW: Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}

              {/* ✅ NEW: Metadata */}
              <div className="text-xs text-muted-foreground">
                Showing {services.length} of {pagination.totalItems} services
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
