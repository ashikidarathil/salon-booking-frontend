'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchAllCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
  updateCoupon,
} from '@/features/coupon/coupon.thunks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { DiscountType, type Coupon } from '@/features/coupon/coupon.types';
import { showSuccess, showError, showConfirm } from '@/common/utils/swal.utils';
import { format } from 'date-fns';
import Pagination from '@/components/pagination/Pagination';

export default function CouponManagementPage() {
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DELETED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { coupons, loading, pagination } = useAppSelector((state) => state.coupon);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormData = {
    code: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 0,
    minBookingAmount: 0,
    expiryDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    maxUsage: 100,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadCoupons = useCallback(() => {
    dispatch(fetchAllCoupons({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined
    }));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCoupons();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [loadCoupons]);

  // Removed local filteredCoupons logic as it's now handled by backend

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code) {
      newErrors.code = 'Coupon code is required';
    } else if (!/^[A-Z0-9]+$/i.test(formData.code)) {
      newErrors.code = 'Must be alphanumeric (no spaces or special chars)';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    } else if (formData.discountType === DiscountType.PERCENTAGE && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (formData.minBookingAmount === undefined || formData.minBookingAmount === null) {
      newErrors.minBookingAmount = 'Minimum booking amount is required';
    } else if (formData.minBookingAmount <= 0) {
      newErrors.minBookingAmount = 'Minimum booking amount must be greater than 0';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (new Date(formData.expiryDate) <= new Date(new Date().setHours(0,0,0,0))) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }

    if (!formData.maxUsage || formData.maxUsage <= 0) {
      newErrors.maxUsage = 'Max usage must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && editingId) {
        await dispatch(updateCoupon({ id: editingId, data: formData })).unwrap();
        showSuccess('Updated!', 'Coupon updated successfully', 2000);
      } else {
        await dispatch(createCoupon(formData)).unwrap();
        showSuccess('Created!', 'Coupon created successfully', 2000);
      }
      handleCloseDialog();
    } catch (error: any) {
      showError('Error', error || `Failed to ${isEditing ? 'update' : 'create'} coupon`);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setIsEditing(true);
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minBookingAmount: coupon.minBookingAmount,
      expiryDate: format(new Date(coupon.expiryDate), 'yyyy-MM-dd'),
      maxUsage: coupon.maxUsage,
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    const action = !currentActive ? 'activate' : 'deactivate';
    
    const isConfirmed = await showConfirm(
      'Are you sure?',
      `Do you want to ${action} this coupon?`,
      `Yes, ${action}`,
    );

    if (isConfirmed) {
      try {
        await dispatch(toggleCouponStatus(id)).unwrap();
        showSuccess('Success', `Coupon ${action}d successfully`, 1500);
      } catch (error: any) {
        showError('Error', error || 'Failed to update status');
      }
    }
  };

  const handleToggleDelete = async (coupon: Coupon) => {
    const action = coupon.isDeleted ? 'restore' : 'delete';
    
    const isConfirmed = await showConfirm(
      'Are you sure?',
      `Do you want to ${action} this coupon?`,
      `Yes, ${action} it!`,
      'Cancel',
      action === 'delete' ? '#d33' : '#3085d6'
    );

    if (isConfirmed) {
      try {
        await dispatch(deleteCoupon(coupon.id)).unwrap();
        showSuccess(
          action === 'delete' ? 'Deleted!' : 'Restored!',
          `Coupon has been ${action === 'delete' ? 'deleted' : 'restored'}.`,
          1500
        );
      } catch (error: any) {
        showError('Error', error || `Failed to ${action} coupon`);
      }
    }
  };

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
          <p className="text-muted-foreground">
            Create and manage discount coupons for your customers.
          </p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setIsAddDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon icon="solar:add-circle-bold" className="size-5" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] theme-admin">
              <form onSubmit={handleSubmit} noValidate>
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                  <DialogDescription>
                    Enter the details for the discount coupon.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="code" className="text-right mt-3">
                      Code
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => {
                          setFormData({ ...formData, code: e.target.value.toUpperCase() });
                          if (errors.code) setErrors({ ...errors, code: '' });
                        }}
                        className={cn(errors.code && "border-destructive")}
                        placeholder="E.g. SUMMER24"
                        disabled={isEditing}
                      />
                      {errors.code && <p className="text-[12px] text-destructive mt-1">{errors.code}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="type" className="text-right mt-3">
                      Type
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.discountType}
                        onValueChange={(v) => setFormData({ ...formData, discountType: v as DiscountType })}
                        disabled={isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value={DiscountType.PERCENTAGE}>Percentage (%)</SelectItem>
                          <SelectItem value={DiscountType.FIXED}>Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="value" className="text-right mt-3">
                      Value
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="value"
                        type="number"
                        value={formData.discountValue || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, discountValue: Number(e.target.value) });
                          if (errors.discountValue) setErrors({ ...errors, discountValue: '' });
                        }}
                        className={cn(errors.discountValue && "border-destructive")}
                        min={0}
                        placeholder={formData.discountType === DiscountType.PERCENTAGE ? "e.g. 10 for 10%" : "e.g. 150 for ₹150"}
                      />
                      {errors.discountValue && <p className="text-[12px] text-destructive mt-1">{errors.discountValue}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="minAmount" className="text-right mt-3 text-xs leading-tight">
                      Min Booking
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="minAmount"
                        type="number"
                        value={formData.minBookingAmount ?? ''}
                        onChange={(e) => {
                          setFormData({ ...formData, minBookingAmount: Number(e.target.value) });
                          if (errors.minBookingAmount) setErrors({ ...errors, minBookingAmount: '' });
                        }}
                        className={cn(errors.minBookingAmount && "border-destructive")}
                        min={1}
                        placeholder="e.g. 500"
                      />
                      {errors.minBookingAmount && <p className="text-[12px] text-destructive mt-1">{errors.minBookingAmount}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="expiry" className="text-right mt-3">
                      Expiry
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="expiry"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => {
                          setFormData({ ...formData, expiryDate: e.target.value });
                          if (errors.expiryDate) setErrors({ ...errors, expiryDate: '' });
                        }}
                        className={cn(errors.expiryDate && "border-destructive")}
                      />
                      {errors.expiryDate && <p className="text-[12px] text-destructive mt-1">{errors.expiryDate}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="maxUsage" className="text-right mt-3">
                      Max Usage
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="maxUsage"
                        type="number"
                        value={formData.maxUsage || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, maxUsage: Number(e.target.value) });
                          if (errors.maxUsage) setErrors({ ...errors, maxUsage: '' });
                        }}
                        className={cn(errors.maxUsage && "border-destructive")}
                        min={1}
                      />
                      {errors.maxUsage && <p className="text-[12px] text-destructive mt-1">{errors.maxUsage}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Coupon' : 'Create Coupon')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"
          />
          <Input
            placeholder="Search by coupon code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => {
          setStatusFilter(v);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">All Coupons</SelectItem>
            <SelectItem value="ACTIVE">Active Only</SelectItem>
            <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            <SelectItem value="DELETED">Deleted Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupons List</CardTitle>
          <CardDescription>
            Manage all your discount coupons, include active, inactive and archived ones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Amount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deleted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id} className={coupon.isDeleted ? 'bg-slate-50/50' : ''}>
                    <TableCell className="font-bold">
                      <div className="flex flex-col">
                        <span className={coupon.isDeleted ? 'text-slate-400 line-through' : ''}>
                          {coupon.code}
                        </span>
                        {coupon.isDeleted && (
                          <span className="text-[10px] text-destructive font-normal italic">Archived</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.discountType === DiscountType.PERCENTAGE
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </TableCell>
                    <TableCell>₹{coupon.minBookingAmount}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">
                          {coupon.usedCount} / {coupon.maxUsage}
                        </span>
                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.min(100, (coupon.usedCount / coupon.maxUsage) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(coupon.expiryDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {coupon.isDeleted ? (
                        <Badge className="bg-yellow-500 text-white cursor-default hover:bg-yellow-500">
                          DELETED
                        </Badge>
                      ) : (
                        <Badge
                          className={cn(
                            "cursor-default",
                            coupon.isActive 
                              ? "bg-green-500 text-white hover:bg-green-500" 
                              : "bg-red-500 text-white hover:bg-red-500"
                          )}
                        >
                          {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.isDeleted ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!coupon.isDeleted && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={coupon.isActive ? "text-amber-500 hover:bg-amber-500/10" : "text-green-500 hover:bg-green-500/10"}
                            onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                            title={coupon.isActive ? "Deactivate Coupon" : "Activate Coupon"}
                          >
                            <Icon 
                              icon={coupon.isActive ? "solar:close-circle-bold" : "solar:check-circle-bold"} 
                              className="size-5" 
                            />
                          </Button>
                        )}
                        {!coupon.isDeleted && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(coupon)}
                            title="Edit Coupon"
                          >
                            <Icon icon="solar:pen-bold" className="size-5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={coupon.isDeleted ? "text-primary hover:bg-primary/10" : "text-destructive hover:bg-destructive/10"}
                          onClick={() => handleToggleDelete(coupon)}
                          title={coupon.isDeleted ? "Restore Coupon" : "Delete Coupon"}
                        >
                          <Icon 
                            icon={coupon.isDeleted ? "solar:refresh-bold" : "solar:trash-bin-trash-bold"} 
                            className="size-5" 
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
