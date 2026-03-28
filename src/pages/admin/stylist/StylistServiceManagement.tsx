'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchStylistServicesPaginated,
  toggleStylistServiceStatus,
} from '@/features/stylistService/stylistService.thunks';
import { useDebounce } from '@/hooks/useDebounce';

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
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import Pagination from '@/components/pagination/Pagination';
import { LoadingGate } from '@/components/common/LoadingGate';
import { clearError } from '@/features/stylistService/stylistService.slice';
import { STYLIST_SERVICE_MESSAGES } from '@/features/stylistService/stylistService.constants';

interface StylistServiceManagementProps {
  stylistId: string;
  stylistName?: string;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 8;

export default function StylistServiceManagement({
  stylistId,
  stylistName,
  onClose,
}: StylistServiceManagementProps) {
  const dispatch = useAppDispatch();
  const { services, loading, error, pagination } = useAppSelector((state) => state.stylistService);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const loadStylistServices = useCallback(() => {
    if (stylistId) {
      dispatch(
        fetchStylistServicesPaginated({
          stylistId,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch || undefined,
          isActive: filterActive === 'all' ? undefined : filterActive === 'active',
        }),
      );
    }
  }, [stylistId, dispatch, currentPage, debouncedSearch, filterActive]);

  useEffect(() => {
    loadStylistServices();
  }, [loadStylistServices]);

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
    try {
      await dispatch(
        toggleStylistServiceStatus({
          stylistId,
          serviceId,
          isActive: newActive,
        }),
      ).unwrap();
      showSuccess('Success', `${serviceName} ${newActive ? 'enabled' : 'disabled'}`);
    } catch (err: unknown) {
      showError('Failed', (err as string) || STYLIST_SERVICE_MESSAGES.TOGGLE_ERROR);
    } finally {
      closeLoading();
    }
  };

  return (
    <div className="space-y-6 bg-white p-10 border-2 rounded-2xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-100"
          >
            <Icon icon="solar:arrow-left-linear" className="size-6 text-slate-500" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
              <Icon icon="solar:scissors-square-bold" className="size-8 text-primary/80" />
              Manage Services - {stylistName || 'Stylist'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Enable or disable services that this stylist can perform.
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="font-semibold px-4 py-1.5 rounded-full text-xs">
          {pagination.totalItems} Total Services
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Filters Row */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="search-services"
                  className="text-[10px] font-semibold tracking-wider text-slate-400 ml-1 "
                >
                  Search Services
                </Label>
                <div className="relative">
                  <Icon
                    icon="solar:magnifer-linear"
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"
                  />
                  <Input
                    id="search-services"
                    placeholder="Search by name or category..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 h-10 rounded-xl border-slate-200 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="w-full md:w-64 space-y-2">
                <Label
                  htmlFor="filter-active"
                  className="text-[10px] font-semibold tracking-wider text-slate-400 ml-1"
                >
                  Status Filter
                </Label>
                <Select value={filterActive} onValueChange={handleActiveFilterChange}>
                  <SelectTrigger
                    id="filter-active"
                    className="h-10 rounded-xl border-slate-200 focus:ring-1 focus:ring-primary"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Disabled Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Full Width Table */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 border-b hover:bg-transparent">
                      <TableHead className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Service Name
                      </TableHead>
                      <TableHead className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Category
                      </TableHead>
                      <TableHead className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </TableHead>
                      <TableHead className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((svc) => (
                      <TableRow
                        key={svc.serviceId}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="px-6 py-4">
                          <span className="font-semibold text-slate-700">{svc.name}</span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge
                            variant="outline"
                            className="font-medium text-slate-500 border-slate-200"
                          >
                            {svc.categoryName || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge
                            className={cn(
                              'font-semibold px-2.5 py-0.5 rounded-full text-[10px]',
                              svc.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
                            )}
                          >
                            {svc.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant={svc.isActive ? 'outline' : 'default'}
                            size="sm"
                            className={cn(
                              'h-8 px-4 text-xs font-semibold rounded-lg transition-all',
                              svc.isActive
                                ? 'text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                : 'bg-primary text-white hover:opacity-90 shadow-sm',
                            )}
                            onClick={() => handleToggleClick(svc.serviceId, svc.isActive, svc.name)}
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
                <div className="p-6 border-t bg-slate-50/30">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </LoadingGate>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
