'use client';

import { useEffect, useState, useCallback } from 'react';
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

import { clearError } from '@/features/user/userSlice';
import { LoadingGate } from '@/components/common/LoadingGate';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';

const ADMIN_COLOR = '#10B981';

export default function UserManagementPage() {
  const dispatch = useAppDispatch();
  const { users, pagination, loading, error } = useAppSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  const loadUsers = useCallback(() => {
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

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

    if (toggleBlockUser.fulfilled.match(result)) {
      await showSuccess(`${action}ed!`, `${name} has been ${action.toLowerCase()}ed`);
    } else {
      await showError('Failed', (result.payload as string) || ERROR_MESSAGES.UPDATE_FAILED);
    }
  };

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-4xl font-bold">User Management</h1>
        <p className="mt-2 text-muted-foreground">Manage all registered customers</p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full"
        />
      </div>

      <LoadingGate
        loading={loading}
        error={error}
        data={users}
        resetError={() => {
          dispatch(clearError());
          loadUsers();
        }}
        emptyMessage={searchTerm ? 'No matches' : 'No registered users yet'}
      >
        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">All Users ({pagination?.totalItems || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
                  {users.map((user) => (
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

            {pagination && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </LoadingGate>
    </div>
  );
}
