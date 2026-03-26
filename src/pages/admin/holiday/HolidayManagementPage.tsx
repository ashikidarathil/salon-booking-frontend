import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchHolidays, createHoliday, deleteHoliday } from '@/features/holiday/holiday.thunks';
import { clearError } from '@/features/holiday/holiday.slice';
import { fetchBranches } from '@/features/branch/branch.thunks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon } from '@iconify/react';
import { LoadingGate } from '@/components/common/LoadingGate';
import { showSuccess, showConfirm, showLoading, closeLoading } from '@/common/utils/swal.utils';
import { format } from 'date-fns';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CreateHolidayDto } from '@/features/holiday/holiday.types';

const holidaySchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    date: z.string().min(1, 'Date is required'),
    isAllBranches: z.boolean(),
    branchId: z.string().nullable().optional(),
  })
  .refine((data) => data.isAllBranches || data.branchId, {
    message: 'Please select a branch or apply to all branches',
    path: ['branchId'],
  });

type HolidayFormData = z.infer<typeof holidaySchema>;

export default function HolidayManagementPage() {
  const dispatch = useAppDispatch();
  const { holidays, loading, error } = useAppSelector((state) => state.holiday);
  const { branches } = useAppSelector((state) => state.branch);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      isAllBranches: true,
      branchId: null,
    },
  });

  const isAllBranches = useWatch({
    control,
    name: 'isAllBranches',
    defaultValue: true,
  });

  useEffect(() => {
    dispatch(fetchHolidays());
    dispatch(fetchBranches());
  }, [dispatch]);

  const onSubmit = async (data: HolidayFormData) => {
    showLoading('Creating holiday...');
    const payload: CreateHolidayDto = {
      name: data.name,
      date: data.date,
      isAllBranches: data.isAllBranches,
      branchId: data.isAllBranches ? null : data.branchId,
    };

    const result = await dispatch(createHoliday(payload));
    closeLoading();

    if (createHoliday.fulfilled.match(result)) {
      showSuccess('Success', 'Holiday created successfully');
      setIsAddDialogOpen(false);
      reset();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      'Delete Holiday?',
      'Are you sure you want to delete this holiday?',
      'Delete',
      'Cancel',
      '#ef4444',
    );

    if (confirmed) {
      showLoading('Deleting...');
      const result = await dispatch(deleteHoliday(id));
      closeLoading();
      if (deleteHoliday.fulfilled.match(result)) {
        showSuccess('Deleted', 'Holiday removed successfully');
      }
    }
  };

  const getBranchName = (branchId?: string | null) => {
    if (!branchId) return 'All Branches';
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.name : 'Unknown Branch';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-heading">Holiday Management</h1>
          <p className="text-muted-foreground">Manage salon-wide and branch-specific holidays</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Icon icon="solar:calendar-add-bold-duotone" className="size-5" />
          Add Holiday
        </Button>
      </div>

      <LoadingGate
        loading={loading && holidays.length === 0}
        error={error}
        data={holidays}
        resetError={() => dispatch(clearError())}
        emptyMessage="No holidays found. Add one to get started."
        emptyIcon="solar:calendar-minimalistic-broken"
      >
        <Card>
          <CardHeader>
            <CardTitle>Existing Holidays</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holiday Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>{format(new Date(holiday.date), 'MMMM do, yyyy')}</TableCell>
                    <TableCell>
                      {holiday.isAllBranches ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          All Branches
                        </span>
                      ) : (
                        <span className="text-sm">{getBranchName(holiday.branchId)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(holiday.id)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="size-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </LoadingGate>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) reset();
        }}
      >
        <DialogContent className="sm:max-w-[425px] theme-admin">
          <DialogHeader>
            <DialogTitle>Add New Holiday</DialogTitle>
            <DialogDescription>Create a new holiday entry for the salon.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Holiday Name</Label>
              <Input id="name" placeholder="e.g., Independence Day" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Controller
                name="isAllBranches"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="isAllBranches"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                )}
              />
              <Label
                htmlFor="isAllBranches"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Apply to all branches
              </Label>
            </div>

            {!isAllBranches && (
              <div className="space-y-2">
                <Label htmlFor="branchId">Select Branch</Label>
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a branch" />
                      </SelectTrigger>
                      <SelectContent className="theme-admin">
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.branchId && (
                  <p className="text-xs text-destructive">{errors.branchId.message}</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Holiday</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
