'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  upsertBranchService,
  toggleBranchServiceStatus,
  fetchBranchServicesPaginated,
} from '@/features/branchService/branchService.thunks';

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
import { LoadingGate } from '@/components/common/LoadingGate';
import { clearError } from '@/features/branchService/branchService.slice';
import { ArrowLeft, Scissors } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 5;

export default function BranchServicesPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { branches } = useAppSelector((state) => state.branch);
  const branchName = branches.find((b) => b.id === branchId)?.name || 'Branch';

  const { services, loading, error, pagination } = useAppSelector((state) => state.branchService);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterConfigured, setFilterConfigured] = useState<'all' | 'configured' | 'notConfigured'>(
    'all',
  );
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingService, setEditingService] = useState<BranchServiceItem | null>(null);
  const [editPrice, setEditPrice] = useState<string>('0');
  const [editDuration, setEditDuration] = useState<string>('0');

  const loadBranchServices = useCallback(() => {
    if (branchId) {
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
  }, [branchId, dispatch, currentPage, search, filterConfigured, filterActive]);

  useEffect(() => {
    loadBranchServices();
  }, [loadBranchServices]);

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
    if (!branchId) return;
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
      loadBranchServices();
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
    if (!branchId) return;
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

    showLoading(`${action === 'Enable' ? 'Enabling' : 'Disabling'}...`);
    const result = await dispatch(
      toggleBranchServiceStatus({
        branchId,
        serviceId,
        isActive: newActive,
      }),
    );
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', `${serviceName} ${newActive ? 'enabled' : 'disabled'}`);
      loadBranchServices();
    } else {
      showError('Failed', 'Could not update status');
    }
  };

  return (
    <div className="p-8 space-y-8 theme-admin mx-auto rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/branches')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Manage Services</h1>
          <p className="text-muted-foreground">{branchName}</p>
        </div>
      </div>

      <Card className="shadow-none border-border/60">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1 space-y-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Branch Services
              </CardTitle>
              <CardDescription>
                Update price, duration, and status for services at this branch.
              </CardDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="search-services">Search</Label>
                  <Input
                    id="search-services"
                    placeholder="Search services..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-configured">Configuration</Label>
                  <Select value={filterConfigured} onValueChange={handleConfiguredFilterChange}>
                    <SelectTrigger id="filter-configured">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="configured">Configured Only</SelectItem>
                      <SelectItem value="notConfigured">Not Configured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-active">Status</Label>
                  <Select value={filterActive} onValueChange={handleActiveFilterChange}>
                    <SelectTrigger id="filter-active">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LoadingGate
            loading={loading}
            error={error}
            data={services}
            resetError={() => {
              dispatch(clearError());
              loadBranchServices();
            }}
            emptyMessage={
              search || filterConfigured !== 'all' || filterActive !== 'all'
                ? 'No services match your filters.'
                : 'No services available for this branch.'
            }
            emptyIcon="hugeicons:service"
          >
            <div className="overflow-x-auto border rounded-lg">
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
                            className="w-24 h-8"
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
                            className="w-24 h-8"
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
                          <Badge variant={svc.isActive ? 'default' : 'destructive'} className="px-3">
                            {svc.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2 text-right whitespace-nowrap">
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

            {pagination.totalPages > 1 && (
              <div className="pt-6 flex justify-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {services.length} of {pagination.totalItems} services
            </div>
          </LoadingGate>
        </CardContent>
      </Card>
    </div>
  );
}
