'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchUsers, toggleBlockUser } from '@/features/user/userThunks';
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
import Pagination from '@/components/pagination/Pagination';
import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
  closeLoading,
} from '@/common/utils/swal.utils';

const ADMIN_COLOR = '#10B981';

export default function UserManagementPage() {
  const dispatch = useAppDispatch();
  const { data, pagination, loading, error } = useAppSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    dispatch(
      fetchUsers({
        page: currentPage,
        limit,
        search: searchTerm,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    );
  }, [dispatch, currentPage, limit, searchTerm]);

  const handleToggleBlock = async (userId: string, name: string, isBlocked: boolean) => {
    const action = isBlocked ? 'Unblock' : 'Block';
    const confirmed = await showConfirm(
      `${action} User?`,
      `Are you sure you want to ${action.toLowerCase()} ${name}?`,
      `Yes, ${action}`,
      'Cancel',
      isBlocked ? ADMIN_COLOR : '#ef4444',
    );

    if (!confirmed) return;

    showLoading(`${action}ing user...`);

    const result = await dispatch(toggleBlockUser({ userId, block: !isBlocked }));

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      await showSuccess(`${action}ed!`, `${name} has been ${action.toLowerCase()}ed`);
    } else {
      await showError('Failed', result.payload as string);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">User Management</h1>
        <p className="mt-2 text-muted-foreground">Manage all registered customers</p>
      </div>

      {/* Search Bar - ✨ NEW */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
          className="w-full"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          {/* ✨ CHANGED: Show total from pagination */}
          <CardTitle className="text-3xl">All Users ({pagination?.totalItems || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-t-4 border-b-4 rounded-full animate-spin border-primary"></div>
              <p className="text-2xl">Loading users...</p>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="py-32 text-center">
              <h2 className="text-3xl font-bold">No Users Found</h2>
              <p className="text-xl text-muted-foreground">
                {searchTerm ? 'No matches' : 'No registered users yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* ✨ CHANGED: Using data from pagination response */}
                    {data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '—'}</TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isBlocked ? 'destructive' : 'secondary'}>
                            {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={user.isBlocked ? 'default' : 'destructive'}
                            onClick={() => handleToggleBlock(user.id, user.name, user.isBlocked)}
                            style={user.isBlocked ? { backgroundColor: ADMIN_COLOR } : {}}
                            className={user.isBlocked ? 'text-white hover:opacity-90' : ''}
                          >
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* ✨ NEW: Pagination from backend response */}
              {pagination && (
                <div className="p-4 border-t">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
