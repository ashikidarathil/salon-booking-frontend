'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  createBranch,
  updateBranch,
  softDeleteBranch,
  restoreBranch,
  fetchPaginatedBranches,
} from '@/features/branch/branch.thunks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Users, Tags, Scissors, Ban, RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Pagination from '@/components/pagination/Pagination';
import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
  closeLoading,
} from '@/common/utils/swal.utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Branch, MapLocation } from '@/features/branch/branch.types';
import BranchStylistModal from './BranchStylistModal';
import BranchCategoryModal from './BranchCategoryModal';
import BranchServiceModal from './BranchServiceModal';
import { MapPin } from 'lucide-react';
import LeafletMapPicker from '@/components/branch/LeafletMapPicker';

const ITEMS_PER_PAGE = 5;

const branchSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type BranchFormData = z.infer<typeof branchSchema>;

export default function BranchesPage() {
  const dispatch = useAppDispatch();
  const { branches, loading, pagination } = useAppSelector((state) => state.branch);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedCategoryBranchId, setSelectedCategoryBranchId] = useState<string | null>(null);
  const [selectedServiceBranchId, setSelectedServiceBranchId] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
  });

  useEffect(() => {
    dispatch(
      fetchPaginatedBranches({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
      }),
    );
  }, [dispatch, currentPage, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleLocationSelect = (location: MapLocation & { address: string }) => {
    setSelectedLocation(location);
    setValue('latitude', location.latitude);
    setValue('longitude', location.longitude);
    setValue('address', location.address);
  };

  const resetFormAndCloseDialog = () => {
    reset();
    setEditingBranch(null);
    setSelectedLocation(undefined);
    setIsMapOpen(false); 
    setIsAddDialogOpen(false); 
  };

  const onSubmit = async (data: BranchFormData) => {
    if (!selectedLocation) {
      await showError('Error', 'Please select a location on the map');
      return;
    }
    showLoading(editingBranch ? 'Updating branch...' : 'Creating branch...');

    let result;
    if (editingBranch) {
      result = await dispatch(updateBranch({ id: editingBranch.id, data }));
    } else {
      result = await dispatch(createBranch(data));
    }

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess(
        editingBranch ? 'Branch Updated' : 'Branch Created',
        editingBranch ? 'Changes saved successfully' : 'New branch added',
      );
      resetFormAndCloseDialog();
      dispatch(
        fetchPaginatedBranches({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
        }),
      );
    } else {
      showError('Failed', 'Could not save branch');
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetFormAndCloseDialog();
    } else {
      setIsAddDialogOpen(open);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setSelectedLocation({ latitude: branch.latitude, longitude: branch.longitude });
    reset({
      name: branch.name,
      address: branch.address,
      phone: branch.phone || '',
      latitude: branch.latitude,
      longitude: branch.longitude,
    });
    setIsAddDialogOpen(true);
  };

  const handleDisable = async (id: string) => {
    const confirmed = await showConfirm(
      'Disable Branch?',
      'This will soft-delete the branch (can be restored later). Continue?',
      'Disable',
      'Cancel',
      '#ef4444',
    );

    if (!confirmed) return;

    showLoading('Disabling...');
    const result = await dispatch(softDeleteBranch(id));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Disabled', 'Branch disabled successfully');
      dispatch(
        fetchPaginatedBranches({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
        }),
      );
    } else {
      showError('Failed', 'Could not disable branch');
    }
  };

  const handleAddNewBranch = () => {
    reset({
      name: '',
      address: '',
      phone: '',
      latitude: 0,
      longitude: 0,
    });
    setEditingBranch(null);
    setSelectedLocation(undefined);
    setIsMapOpen(false);
    setIsAddDialogOpen(true);
  };

  const handleRestore = async (id: string) => {
    showLoading('Restoring...');
    const result = await dispatch(restoreBranch(id));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Restored', 'Branch restored successfully');
      dispatch(
        fetchPaginatedBranches({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
        }),
      );
    } else {
      showError('Failed', 'Could not restore branch');
    }
  };

  const handleManageStylists = (branchId: string) => {
    setSelectedBranchId(branchId);
  };

  const handleDrawerClose = () => {
    setSelectedBranchId(null);
  };

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Branch Management</h1>
          <p className="mt-2 text-muted-foreground">Manage all salon branches</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNewBranch}>Add New Branch</Button>
          </DialogTrigger>
          <DialogContent className="theme-admin sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
              <DialogDescription>
                {editingBranch
                  ? 'Update branch details'
                  : 'Fill in details and select location on map'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label>Branch Name *</Label>
                <Input {...register('name')} placeholder="Main Salon Branch" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Address *</Label>
                <Input {...register('address')} placeholder="123 Main Street, City" />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input {...register('phone')} placeholder="+91 98765 43210" />
              </div>

              <div>
                <Label>Location *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    readOnly
                    value={
                      selectedLocation
                        ? `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
                        : 'Click "Select on Map" to choose location'
                    }
                    className="bg-gray-100"
                  />
                  <Button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="gap-2 whitespace-nowrap"
                  >
                    <MapPin className="w-4 h-4" />
                    Select on Map
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => resetFormAndCloseDialog()}>
                  Cancel
                </Button>
                <Button type="submit">{editingBranch ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name or address..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Branches ({pagination?.totalItems || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-t-4 border-b-4 rounded-full animate-spin border-primary"></div>
              <p className="text-2xl">Loading branches...</p>
            </div>
          ) : branches.length === 0 ? (
            <div className="py-32 text-center">
              <h2 className="text-3xl font-bold">No Branches Found</h2>
              <p className="text-xl text-muted-foreground">
                {searchTerm ? 'No matches' : 'Add your first branch above'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Deleted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>{branch.phone || '—'}</TableCell>
                        <TableCell className="text-sm">
                          {branch.latitude != null && branch.longitude != null
                            ? `${branch.latitude.toFixed(4)}, ${branch.longitude.toFixed(4)}`
                            : '—'}{' '}
                        </TableCell>
                        <TableCell>
                          {branch.isDeleted ? (
                            <Badge variant="destructive">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap ">
                          <div className="hidden md:flex items-center justify-end gap-1.5 ">
                            <TooltipProvider>
                              {/* Edit */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => handleEdit(branch)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  Edit Branch
                                </TooltipContent>
                              </Tooltip>

                              {/* Stylists */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => handleManageStylists(branch.id)}
                                  >
                                    <Users className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  Manage Stylists
                                </TooltipContent>
                              </Tooltip>

                              {/* Categories */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => setSelectedCategoryBranchId(branch.id)}
                                  >
                                    <Tags className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  Manage Categories
                                </TooltipContent>
                              </Tooltip>

                              {/* Services */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => setSelectedServiceBranchId(branch.id)}
                                  >
                                    <Scissors className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  Manage Services
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {branch.isDeleted ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="ml-2 text-white bg-green-600 hover:bg-green-700 hover:text-white"
                                onClick={() => handleRestore(branch.id)}
                              >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Restore
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="ml-2 text-white bg-red-600 hover:bg-red-700 hover:text-white"
                                onClick={() => handleDisable(branch.id)}
                              >
                                <Ban className="mr-1.5 h-3.5 w-3.5" />
                                Disable
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 border-t">
                <Pagination
                  currentPage={pagination?.currentPage || 1}
                  totalPages={pagination?.totalPages || 1}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <LeafletMapPicker
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedLocation}
        title={editingBranch ? 'Update Branch Location' : 'Select Branch Location'}
      />

      {selectedBranchId && (
        <BranchStylistModal
          branchId={selectedBranchId}
          branchName={branches.find((b) => b.id === selectedBranchId)?.name}
          open={!!selectedBranchId}
          onClose={handleDrawerClose}
        />
      )}

      {selectedCategoryBranchId && (
        <BranchCategoryModal
          branchId={selectedCategoryBranchId}
          branchName={branches.find((b) => b.id === selectedCategoryBranchId)?.name}
          open={!!selectedCategoryBranchId}
          onClose={() => setSelectedCategoryBranchId(null)}
        />
      )}

      {selectedServiceBranchId && (
        <BranchServiceModal
          branchId={selectedServiceBranchId}
          branchName={branches.find((b) => b.id === selectedServiceBranchId)?.name}
          open={!!selectedServiceBranchId}
          onClose={() => setSelectedServiceBranchId(null)}
        />
      )}
    </div>
  );
}
