// frontend/src/pages/admin/stylist/StylistManagementPage.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchStylists,
  approveStylist,
  rejectStylist,
  toggleBlockStylist,
  createStylistInvite,
  sendInviteToApplied,
} from '@/features/stylistInvite/stylistInviteThunks';
import { clearInviteLink } from '@/features/stylistInvite/stylistInviteSlice';

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
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import Pagination from '@/components/pagination/Pagination';
import { Copy, Check } from 'lucide-react';
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '@/utils/swal'; // ← NEW

import type { StylistListItem } from '@/services/stylistInvite.service';

const ITEMS_PER_PAGE = 5;

const ADMIN_COLOR = '#10B981'; // Emerald green

export default function StylistManagementPage() {
  const dispatch = useAppDispatch();
  const { stylists, loading, inviteLink, error } = useAppSelector((state) => state.stylistInvite);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewInviteDialog, setViewInviteDialog] = useState<StylistListItem | null>(null);
  const [isManualInviteOpen, setIsManualInviteOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [manualForm, setManualForm] = useState({
    email: '',
    specialization: '',
    experience: 0,
  });

  useEffect(() => {
    dispatch(fetchStylists());
  }, [dispatch]);

  useEffect(() => {
    if (inviteLink) {
      const timer = setTimeout(() => dispatch(clearInviteLink()), 15000);
      return () => clearTimeout(timer);
    }
  }, [inviteLink, dispatch]);

  const handleManualInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading('Sending invitation...');

    const result = await dispatch(
      createStylistInvite({
        email: manualForm.email,
        specialization: manualForm.specialization,
        experience: manualForm.experience,
      }),
    );

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      await showSuccess('Invitation Sent!', 'Stylist has been invited successfully');
      setTimeout(() => dispatch(fetchStylists()), 500);
    } else {
      await showError('Failed to Send Invite', error || 'Please try again');
    }

    setManualForm({ email: '', specialization: '', experience: 0 });
  };

  const handleSendInviteToApplied = async (userId: string, name: string) => {
    const confirmed = await showConfirm(
      'Send Invitation?',
      `Are you sure you want to send invitation to ${name || 'this stylist'}?`,
      'Yes, Send',
      'Cancel',
      ADMIN_COLOR,
    );

    if (!confirmed) return;

    showLoading('Sending invitation...');

    const result = await dispatch(sendInviteToApplied({ userId }));

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      await showSuccess('Invitation Sent!', `${name || 'Stylist'} has been invited`);
      setTimeout(() => dispatch(fetchStylists()), 500);
      if (viewInviteDialog?.userId === userId) {
        setViewInviteDialog(null);
      }
    } else {
      await showError('Failed', 'Could not send invitation');
    }
  };

  const handleApprove = async (userId: string, name: string) => {
    const confirmed = await showConfirm(
      'Approve Stylist?',
      `Approve ${name || 'this stylist'} to join the platform?`,
      'Yes, Approve',
      'Cancel',
      ADMIN_COLOR,
    );

    if (!confirmed) return;

    showLoading('Approving stylist...');

    const result = await dispatch(approveStylist({ userId }));

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      await showSuccess('Approved!', `${name || 'Stylist'} is now active`);
      dispatch(fetchStylists());
    } else {
      await showError('Failed', 'Could not approve stylist');
    }
  };

  const handleReject = async (userId: string, name: string) => {
    const confirmed = await showConfirm(
      'Reject Stylist?',
      `Reject ${name || 'this stylist'}? This cannot be undone.`,
      'Yes, Reject',
      'Cancel',
      '#ef4444', // red for reject
    );

    if (!confirmed) return;

    showLoading('Rejecting stylist...');

    const result = await dispatch(rejectStylist({ userId }));

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      await showSuccess('Rejected', `${name || 'Stylist'} has been rejected`);
      dispatch(fetchStylists());
    } else {
      await showError('Failed', 'Could not reject stylist');
    }
  };

  const handleToggleBlock = async (userId: string, name: string, isBlocked: boolean) => {
    const action = isBlocked ? 'Unblock' : 'Block';
    const confirmed = await showConfirm(
      `${action} Stylist?`,
      `Are you sure you want to ${action.toLowerCase()} ${name || 'this stylist'}?`,
      `Yes, ${action}`,
      'Cancel',
      isBlocked ? ADMIN_COLOR : '#ef4444',
    );

    if (!confirmed) return;

    showLoading(`${action}ing stylist...`);

    const result = await dispatch(toggleBlockStylist({ userId, block: !isBlocked }));

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      await showSuccess(`${action}ed!`, `${name || 'Stylist'} has been ${action.toLowerCase()}ed`);
      dispatch(fetchStylists());
    } else {
      await showError('Failed', `Could not ${action.toLowerCase()} stylist`);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredStylists = stylists.filter(
    (stylist) =>
      stylist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stylist.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredStylists.length / ITEMS_PER_PAGE);
  const paginatedStylists = filteredStylists.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getFlowStatus = (stylist: StylistListItem): string => {
    if (stylist.status === 'ACTIVE') return 'ACTIVE';
    if (stylist.inviteStatus === 'ACCEPTED') return 'ACCEPTED';
    if (stylist.inviteStatus === 'PENDING') return 'PENDING';
    if (stylist.inviteStatus === 'EXPIRED' || stylist.inviteStatus === 'CANCELLED')
      return 'EXPIRED';
    return 'APPLIED';
  };

  const getStatusBadge = (stylist: StylistListItem) => {
    const flowStatus = getFlowStatus(stylist);

    if (flowStatus === 'ACTIVE') return <Badge className="bg-green-500">ACTIVE</Badge>;
    if (flowStatus === 'APPLIED') return <Badge variant="secondary" className='bg-yellow-300'>APPLIED</Badge>;
    if (flowStatus === 'PENDING') return <Badge className="bg-blue-500">INVITE SENT</Badge>;
    if (flowStatus === 'EXPIRED') return <Badge variant="destructive" className='bg-red-500'>EXPIRED</Badge>;
    if (flowStatus === 'ACCEPTED') return <Badge className="bg-purple-500">REGISTERED</Badge>;
    return <Badge variant="outline">{flowStatus}</Badge>;
  };

  const getActionButtons = (stylist: StylistListItem) => {
    const { userId, isBlocked, name = 'Stylist' } = stylist;
    const flowStatus = getFlowStatus(stylist);

    if (flowStatus === 'APPLIED') {
      return (
        <Button
          size="sm"
          onClick={() => handleSendInviteToApplied(userId, name)}
          style={{ backgroundColor: ADMIN_COLOR }}
          className="text-white hover:opacity-90"
        >
          Send Invite
        </Button>
      );
    }

    if (flowStatus === 'PENDING') {
      return (
        <Button size="sm" variant="outline" onClick={() => setViewInviteDialog(stylist)}>
          View Link
        </Button>
      );
    }

    if (flowStatus === 'ACCEPTED') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleApprove(userId, name)}
            style={{ backgroundColor: ADMIN_COLOR }}
            className="text-white hover:opacity-90"
          >
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleReject(userId, name)}>
            Reject
          </Button>
        </div>
      );
    }

    if (flowStatus === 'ACTIVE') {
      return (
        <Button
          size="sm"
          variant={isBlocked ? 'default' : 'destructive'}
          onClick={() => handleToggleBlock(userId, name, isBlocked)}
          style={isBlocked ? { backgroundColor: ADMIN_COLOR } : {}}
          className={isBlocked ? 'text-white hover:opacity-90' : ''}
        >
          {isBlocked ? 'Unblock' : 'Block'}
        </Button>
      );
    }

    return <span className="text-sm text-muted-foreground">No action</span>;
  };

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Stylist Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all stylist applications, invites, registrations, and team members
          </p>
        </div>

        {/* Manual Invite Modal */}
        <Dialog open={isManualInviteOpen} onOpenChange={setIsManualInviteOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              style={{ backgroundColor: ADMIN_COLOR }}
              className="text-white hover:opacity-90"
            >
              Invite Stylist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New Stylist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualInvite} className="space-y-6">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="stylist@salon.com"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input
                  placeholder="Hair Cutting, Coloring..."
                  value={manualForm.specialization}
                  onChange={(e) => setManualForm({ ...manualForm, specialization: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={manualForm.experience}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, experience: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full text-white hover:opacity-90"
                style={{ backgroundColor: ADMIN_COLOR }}
              >
                Send Invitation
              </Button>
            </form>

            {inviteLink && (
              <div className="p-6 mt-6 border border-green-300 rounded-lg bg-green-50">
                <p className="mb-3 font-bold text-green-800">✓ Invitation Created!</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 p-2 font-mono text-sm break-all bg-white border rounded"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyLink(inviteLink)}
                    className="px-3"
                  >
                    {copiedLink === inviteLink ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-green-700">Expires in 24 hours</p>
              </div>
            )}

            {error && (
              <div className="p-4 mt-4 border border-red-300 rounded-lg bg-red-50">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Stylists Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">All Stylists ({filteredStylists.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-t-4 border-b-4 rounded-full animate-spin border-primary"></div>
              <p className="text-2xl">Loading stylists...</p>
            </div>
          ) : filteredStylists.length === 0 ? (
            <div className="py-32 text-center">
              <h2 className="text-3xl font-bold">No Stylists Found</h2>
              <p className="text-xl text-muted-foreground">
                {searchTerm ? 'No matches' : 'No applications or team members yet'}
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
                      <TableHead>Specialization</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Blocked</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStylists.map((stylist) => (
                      <TableRow key={stylist.userId}>
                        <TableCell className="font-medium">
                          {stylist.name || 'Pending Registration'}
                        </TableCell>
                        <TableCell>{stylist.email || '—'}</TableCell>
                        <TableCell>{stylist.specialization}</TableCell>
                        <TableCell>{stylist.experience} years</TableCell>
                        <TableCell>{getStatusBadge(stylist)}</TableCell>
                        <TableCell>
                          <Badge variant={stylist.isBlocked ? 'destructive' : 'secondary'}>
                            {stylist.isBlocked ? 'YES' : 'NO'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{getActionButtons(stylist)}</TableCell>
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

      {/* View Invite Link Dialog */}
      <Dialog open={!!viewInviteDialog} onOpenChange={() => setViewInviteDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stylist Invitation Link</DialogTitle>
            <DialogDescription>
              Share this link with {viewInviteDialog?.name} to complete registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewInviteDialog?.inviteLink ? (
              <>
                <div className="p-4 font-mono text-sm break-all bg-gray-100 rounded-lg">
                  {viewInviteDialog.inviteLink}
                </div>

                {viewInviteDialog.inviteExpiresAt && (
                  <div className="p-3 text-sm border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-blue-800">
                      ⏰ Expires: {new Date(viewInviteDialog.inviteExpiresAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (viewInviteDialog.inviteLink) {
                      handleCopyLink(viewInviteDialog.inviteLink);
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {copiedLink === viewInviteDialog.inviteLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>No active invite found</p>
                {viewInviteDialog && (
                  <Button
                    onClick={() => {
                      handleSendInviteToApplied(
                        viewInviteDialog.userId,
                        viewInviteDialog.name || '',
                      );
                      setViewInviteDialog(null);
                    }}
                    className="mt-4 text-white hover:opacity-90"
                    style={{ backgroundColor: ADMIN_COLOR }}
                  >
                    Send Invite Now
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
