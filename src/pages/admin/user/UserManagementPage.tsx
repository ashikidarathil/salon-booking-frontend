// frontend/src/pages/admin/user/UserManagementPage.tsx

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
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '@/utils/swal';

const ITEMS_PER_PAGE = 5;
const ADMIN_COLOR = '#10B981';

export default function UserManagementPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

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
      // No need to refetch — slice updates optimistically
    } else {
      await showError('Failed', result.payload as string);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-destructive">Error: {error}</p>
      </div>
    );
  }

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-t-4 border-b-4 rounded-full animate-spin border-primary"></div>
              <p className="text-2xl">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
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
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '—'}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={user.isBlocked ? 'destructive' : 'secondary'}>
                            {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={user.isBlocked ? 'default' : 'destructive'}
                            onClick={() =>
                              handleToggleBlock(user.userId, user.name, user.isBlocked)
                            }
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

              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
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
