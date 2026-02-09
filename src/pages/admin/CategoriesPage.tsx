// src/pages/admin/CategoriesPage.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  softDeleteCategory,
  restoreCategory,
  fetchPaginatedCategories,
} from '@/features/category/categoryThunks';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import type { Category } from '@/features/category/category.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Power, Ban, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, loading, pagination } = useAppSelector((state) => state.category);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    dispatch(
      fetchPaginatedCategories({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
    );
  }, [dispatch, currentPage, searchTerm, statusFilter]);

  const onSubmit = async (data: CategoryFormData) => {
    showLoading(editingCategory ? 'Updating category...' : 'Creating category...');

    let result;
    if (editingCategory) {
      result = await dispatch(updateCategory({ id: editingCategory.id, data }));
    } else {
      result = await dispatch(createCategory(data));
    }

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess(
        editingCategory ? 'Category Updated' : 'Category Created',
        editingCategory ? 'Changes saved successfully' : 'New category added',
      );
      reset({
        name: '',
        description: '',
      });
      setEditingCategory(null);
      setIsAddDialogOpen(false);
      dispatch(
        fetchPaginatedCategories({
          page: 1,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
      setCurrentPage(1);
    } else {
      const errorMessage = result.payload as string;
      showError('Failed', errorMessage);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      description: cat.description || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate';

    const confirmed = await showConfirm(
      `${action} Category?`,
      `Are you sure you want to ${action.toLowerCase()} this category?`,
      'Yes, ' + action,
      'Cancel',
    );

    if (!confirmed) return;

    showLoading(`${action}ing...`);
    const result = await dispatch(toggleCategoryStatus({ id, status: newStatus }));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', `Category ${action.toLowerCase()}d`);
      dispatch(
        fetchPaginatedCategories({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
    } else {
      showError('Failed', 'Could not update status');
    }
  };

  const handleSoftDelete = async (id: string) => {
    const confirmed = await showConfirm(
      'Soft Delete Category?',
      'This will mark the category as deleted (can be restored later). Continue?',
      'Delete',
      'Cancel',
      '#ef4444',
    );

    if (!confirmed) return;

    showLoading('Deleting...');
    const result = await dispatch(softDeleteCategory(id));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Deleted', 'Category soft-deleted');
      dispatch(
        fetchPaginatedCategories({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
    } else {
      showError('Failed', 'Could not delete category');
    }
  };

  const handleRestore = async (id: string) => {
    showLoading('Restoring...');
    const result = await dispatch(restoreCategory(id));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Restored', 'Category restored successfully');
      dispatch(
        fetchPaginatedCategories({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
    } else {
      showError('Failed', 'Could not restore category');
    }
  };

  const getStatusBadge = (status: 'ACTIVE' | 'INACTIVE') => {
    return (
      <Badge className={status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Category Management</h1>
          <p className="mt-2 text-muted-foreground">Manage all salon service categories</p>
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);

            if (!open) {
              setEditingCategory(null);
              reset({
                name: '',
                description: '',
              });
            }
          }}
        >
          {' '}
          <DialogTrigger asChild>
            <Button>Add New Category</Button>
          </DialogTrigger>
          <DialogContent className="theme-admin">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label>Category Name *</Label>
                <Input {...register('name')} placeholder="Hair Coloring" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input {...register('description')} placeholder="For all coloring services..." />
              </div>
              <div className="flex justify-end gap-3">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-between gap-2">
              {statusFilter === 'ALL' && (
                <>
                  <span>All Categories</span>
                </>
              )}
              {statusFilter === 'ACTIVE' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Active</span>
                </>
              )}
              {statusFilter === 'INACTIVE' && (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Inactive</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={statusFilter === 'ALL' ? 'bg-accent' : ''}
            >
              All Categories
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setStatusFilter('ACTIVE');
                setCurrentPage(1);
              }}
              className={statusFilter === 'ACTIVE' ? 'bg-accent' : ''}
            >
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setStatusFilter('INACTIVE');
                setCurrentPage(1);
              }}
              className={statusFilter === 'INACTIVE' ? 'bg-accent' : ''}
            >
              <XCircle className="w-4 h-4 mr-2 text-red-600" />
              Inactive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-t-4 border-b-4 rounded-full animate-spin border-primary"></div>
              <p className="text-2xl">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-32 text-center">
              <h2 className="text-3xl font-bold">No Categories Found</h2>
              <p className="text-xl text-muted-foreground">
                {searchTerm ? 'No matches' : 'Add your first category above'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deleted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">
                          {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                        </TableCell>
                        <TableCell>{cat.description || '—'}</TableCell>
                        <TableCell>{getStatusBadge(cat.status)}</TableCell>
                        <TableCell>
                          {cat.isDeleted ? (
                            <Badge variant="destructive">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="hidden md:flex items-center justify-end gap-1.5">
                            <TooltipProvider>
                              {/* Edit */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => handleEdit(cat)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  Edit Category
                                </TooltipContent>
                              </Tooltip>

                              {/* Toggle Activate/Deactivate */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 "
                                    onClick={() => handleToggleStatus(cat.id, cat.status)}
                                  >
                                    {cat.status === 'ACTIVE' ? (
                                      <Ban className="w-4 h-4 text-red-600" />
                                    ) : (
                                      <Power className="w-4 h-4 text-green-600" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  {cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Category
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Delete / Restore – always visible on desktop */}
                            {cat.isDeleted ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="ml-2 text-white bg-green-600 hover:bg-green-700 hover:text-white"
                                onClick={() => handleRestore(cat.id)}
                              >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Restore
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="ml-2 text-white bg-red-600 hover:bg-red-700 hover:text-white"
                                onClick={() => handleSoftDelete(cat.id)}
                              >
                                <Ban className="mr-1.5 h-3.5 w-3.5" />
                                Delete
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
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
