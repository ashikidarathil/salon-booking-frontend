'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  toggleBranchCategory,
  fetchBranchCategoriesPaginated,
} from '@/features/branchCategory/branchCategory.thunks';
import Pagination from '@/components/pagination/Pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
  closeLoading,
} from '@/common/utils/swal.utils';

interface BranchCategoryModalProps {
  branchId: string;
  branchName?: string;
  open: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 5;

export default function BranchCategoryModal({
  branchId,
  branchName,
  open,
  onClose,
}: BranchCategoryModalProps) {
  const dispatch = useAppDispatch();
  const { categories, loading, pagination } = useAppSelector((state) => state.branchCategory);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (open && branchId) {
      dispatch(
        fetchBranchCategoriesPaginated({
          branchId,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          isActive: filterActive === 'all' ? undefined : filterActive === 'active',
        }),
      );
    }
  }, [open, branchId, dispatch, currentPage, search, filterActive]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterActive(value as 'all' | 'active' | 'inactive');
    setCurrentPage(1);
  };
  const handleToggleClick = async (
    categoryId: string,
    currentActive: boolean,
    categoryName: string,
  ) => {
    const newActive = !currentActive;
    const action = newActive ? 'Enable' : 'Disable';

    const confirmed = await showConfirm(
      `${action} Category?`,
      `${action} ${categoryName} for this branch?`,
      action,
      'Cancel',
      newActive ? '#10B981' : '#ef4444',
    );

    if (!confirmed) return;

    const isEnable = newActive;

    showLoading(`${isEnable ? 'Enabling' : 'Disabling'}...`);
    const result = await dispatch(
      toggleBranchCategory({
        branchId,
        categoryId,
        isActive: isEnable,
      }),
    );
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', `${categoryName} ${isEnable ? 'enabled' : 'disabled'}`);
      // Refresh the current page after toggle
      dispatch(
        fetchBranchCategoriesPaginated({
          branchId,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          isActive: filterActive === 'all' ? undefined : filterActive === 'active',
        }),
      );
    } else {
      showError('Failed', 'Could not update category');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) onClose();
      }}
    >
      <DialogContent className="theme-admin max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            {branchName || `Branch ${branchId}`} - Enable or disable categories available at this
            branch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ✅ NEW: Search and Filter Section */}
          <div className="space-y-3">
            {/* Search */}
            <div>
              <Label htmlFor="search-categories" className="text-sm font-medium">
                Search
              </Label>
              <Input
                id="search-categories"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Filter */}
            <div>
              <Label htmlFor="filter-active" className="text-sm font-medium">
                Filter by Status
              </Label>
              <Select value={filterActive} onValueChange={handleFilterChange}>
                <SelectTrigger id="filter-active" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="z-[2000] bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Disabled Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ✅ Table with pagination */}
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="py-8 text-center border rounded-lg text-muted-foreground bg-muted/30">
              {search || filterActive !== 'all'
                ? 'No categories match your filters.'
                : 'No categories available for this branch.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.categoryId}>
                        <TableCell className="font-medium">
                          {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cat.isActive ? 'default' : 'destructive'}>
                            {cat.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={cat.isActive ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() =>
                              handleToggleClick(cat.categoryId, cat.isActive, cat.name)
                            }
                          >
                            {cat.isActive ? 'Disable' : 'Enable'}
                          </Button>
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
                Showing {categories.length} of {pagination.totalItems} categories
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
