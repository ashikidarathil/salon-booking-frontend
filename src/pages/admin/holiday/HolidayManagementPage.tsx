import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchHolidays, createHoliday, deleteHoliday } from '@/features/holiday/holiday.thunks';
import { clearError } from '@/features/holiday/holiday.slice';
import { fetchBranches } from '@/features/branch/branch.thunks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
    date: z
      .string()
      .min(1, 'Date is required')
      .refine((date) => {
        const selected = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      }, 'Date cannot be in the past'),
    isAllBranches: z.boolean(),
    branchIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.isAllBranches || (data.branchIds && data.branchIds.length > 0), {
    message: 'Please select at least one branch or apply to all branches',
    path: ['branchIds'],
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
      branchIds: [],
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
      branchIds: data.isAllBranches ? [] : data.branchIds,
    };

    const result = await dispatch(createHoliday(payload));
    closeLoading();

    if (createHoliday.fulfilled.match(result)) {
      showSuccess('Success', 'Holiday created successfully');
      setIsAddDialogOpen(false);
      reset();
      dispatch(fetchHolidays()); // Re-fetch to show all newly created records
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
        dispatch(fetchHolidays());
      }
    }
  };

  const getBranchData = (branchIds: string[]) => {
    if (!branchIds || branchIds.length === 0) return [];
    return branchIds
      .map((id) => branches.find((b) => String(b.id) === String(id)))
      .filter((b): b is NonNullable<typeof b> => !!b);
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
                        <Badge
                          variant="outline"
                          className="bg-primary/5 text-primary border-primary/20"
                        >
                          All Branches
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {getBranchData(holiday.branchIds)
                            .slice(0, 2)
                            .map((branch) => (
                              <Badge
                                key={branch.id}
                                variant="secondary"
                                className="whitespace-nowrap"
                              >
                                {branch.name}
                              </Badge>
                            ))}
                          {holiday.branchIds.length > 2 && (
                            <Badge
                              variant="default"
                              className="text-[10px] px-1.5 py-0 bg-orange-500 hover:bg-orange-600 border-none text-white"
                            >
                              +{holiday.branchIds.length - 2} more
                            </Badge>
                          )}
                        </div>
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
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('date')}
              />
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
              <div className="space-y-3">
                <Label>Select Branches</Label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-3 border rounded-xl bg-slate-50/50">
                  <Controller
                    name="branchIds"
                    control={control}
                    render={({ field }) => (
                      <>
                        {branches.map((branch) => (
                          <label
                            key={branch.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-border"
                          >
                            <input
                              type="checkbox"
                              checked={field.value?.includes(branch.id)}
                              onChange={(e) => {
                                const newValues = e.target.checked
                                  ? [...(field.value || []), branch.id]
                                  : (field.value || []).filter((id: string) => id !== branch.id);
                                field.onChange(newValues);
                              }}
                              className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">{branch.name}</span>
                          </label>
                        ))}
                      </>
                    )}
                  />
                </div>
                {errors.branchIds && (
                  <p className="text-xs text-destructive">{errors.branchIds.message}</p>
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
