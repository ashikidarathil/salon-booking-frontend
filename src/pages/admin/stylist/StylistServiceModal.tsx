'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchStylistServicesPaginated,
  toggleStylistServiceStatus,
} from '@/features/stylistService/stylistService.thunks';

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
import Pagination from '@/components/pagination/Pagination';
import { LoadingGate } from '@/components/common/LoadingGate';
import { clearError } from '@/features/stylistService/stylistService.slice';

interface StylistServiceModalProps {
  stylistId: string;
  stylistName?: string;
  open: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 5;

export default function StylistServiceModal({
  stylistId,
  stylistName,
  open,
  onClose,
}: StylistServiceModalProps) {
  const dispatch = useAppDispatch();
  const { services, loading, error, pagination } = useAppSelector((state) => state.stylistService);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const loadStylistServices = () => {
    if (stylistId) {
      dispatch(
        fetchStylistServicesPaginated({
          stylistId,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          isActive: filterActive === 'all' ? undefined : filterActive === 'active',
        }),
      );
    }
  };

  useEffect(() => {
    if (open) {
      loadStylistServices();
    }
  }, [open, stylistId, dispatch, currentPage, search, filterActive]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleActiveFilterChange = (value: string) => {
    setFilterActive(value as 'all' | 'active' | 'inactive');
    setCurrentPage(1);
  };

  const handleToggleClick = async (
    serviceId: string,
    currentActive: boolean,
    serviceName: string,
  ) => {
    const newActive = !currentActive;
    const action = newActive ? 'Enable' : 'Disable';

    const confirmed = await showConfirm(
      `${action} Service?`,
      `${action} ${serviceName} for this stylist?`,
      action,
      'Cancel',
      newActive ? '#10B981' : '#ef4444',
    );

    if (!confirmed) return;

    showLoading(`${newActive ? 'Enabling' : 'Disabling'}...`);
    const result = await dispatch(
      toggleStylistServiceStatus({
        stylistId,
        serviceId,
        isActive: newActive,
      }),
    );
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', `${serviceName} ${newActive ? 'enabled' : 'disabled'}`);
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
          setFilterActive('all');
          onClose();
        }
      }}
    >
      <DialogContent className="theme-admin max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Services - {stylistName || 'Stylist'}</DialogTitle>
          <DialogDescription>
            Enable or disable services that this stylist can perform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <LoadingGate
            loading={loading}
            error={error}
            data={services}
            resetError={() => {
              dispatch(clearError());
              loadStylistServices();
            }}
            emptyMessage={
              search || filterActive !== 'all'
                ? 'No services match your filters.'
                : 'No services found.'
            }
            emptyIcon="hugeicons:service"
          >
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
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
                        <Badge variant={svc.isActive ? 'default' : 'destructive'}>
                          {svc.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={svc.isActive ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() =>
                            handleToggleClick(svc.serviceId, svc.isActive, svc.name)
                          }
                        >
                          {svc.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pt-4 border-t">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Showing {services.length} of {pagination.totalItems} services
            </div>
          </LoadingGate>
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
