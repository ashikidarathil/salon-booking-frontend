'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  toggleBranchCategory,
  fetchBranchCategoriesPaginated,
} from '@/features/branchCategory/branchCategory.thunks';
import Pagination from '@/components/pagination/Pagination';
import { LoadingGate } from '@/components/common/LoadingGate';
import { clearError } from '@/features/branchCategory/branchCategory.slice';
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
import { ArrowLeft, Tags } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 5;

export default function BranchCategoriesPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { branches } = useAppSelector((state) => state.branch);
  const branchName = branches.find((b) => b.id === branchId)?.name || 'Branch';

  const { categories, loading, error, pagination } = useAppSelector(
    (state) => state.branchCategory,
  );

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const loadBranchCategories = useCallback(() => {
    if (branchId) {
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
  }, [branchId, dispatch, currentPage, search, filterActive]);

  useEffect(() => {
    loadBranchCategories();
  }, [loadBranchCategories]);

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
    if (!branchId) return;
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

    showLoading(`${action === 'Enable' ? 'Enabling' : 'Disabling'}...`);
    const result = await dispatch(
      toggleBranchCategory({
        branchId,
        categoryId,
        isActive: newActive,
      }),
    );
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', `${categoryName} ${newActive ? 'enabled' : 'disabled'}`);
      loadBranchCategories();
    } else {
      showError('Failed', 'Could not update category');
    }
  };

  return (
    <div className="p-8 space-y-8 theme-admin mx-auto rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/branches')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Manage Categories</h1>
          <p className="text-muted-foreground">{branchName}</p>
        </div>
      </div>

      <Card className="shadow-none border-border/60">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1 space-y-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Tags className="w-5 h-5" />
                Branch Categories
              </CardTitle>
              <CardDescription>
                Enable or disable categories available at this branch.
              </CardDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="search-categories">Search</Label>
                  <Input
                    id="search-categories"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-active">Filter by Status</Label>
                  <Select value={filterActive} onValueChange={handleFilterChange}>
                    <SelectTrigger id="filter-active">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Categories</SelectItem>
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
            data={categories}
            resetError={() => {
              dispatch(clearError());
              loadBranchCategories();
            }}
            emptyMessage={
              search || filterActive !== 'all'
                ? 'No categories match your filters.'
                : 'No categories available for this branch.'
            }
            emptyIcon="hugeicons:service"
          >
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
                      <TableCell className="font-medium text-base">
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cat.isActive ? 'default' : 'destructive'} className="px-3">
                          {cat.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={cat.isActive ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleClick(cat.categoryId, cat.isActive, cat.name)}
                        >
                          {cat.isActive ? 'Disable' : 'Enable'}
                        </Button>
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
              Showing {categories.length} of {pagination.totalItems} categories
            </div>
          </LoadingGate>
        </CardContent>
      </Card>
    </div>
  );
}
