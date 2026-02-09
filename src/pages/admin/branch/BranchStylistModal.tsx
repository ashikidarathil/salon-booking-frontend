'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  assignStylist,
  unassignStylist,
  fetchBranchStylistsPaginated,
  fetchUnassignedStylistsPaginated,
} from '@/features/stylistBranch/stylistBranch.thunks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
  closeLoading,
} from '@/common/utils/swal.utils';
import Pagination from '@/components/pagination/Pagination';
// import { Badge } from '@/components/ui/badge';

interface BranchStylistModalProps {
  branchId: string;
  branchName?: string;
  open: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 5;

export default function BranchStylistModal({
  branchId,
  branchName,
  open,
  onClose,
}: BranchStylistModalProps) {
  const dispatch = useAppDispatch();
  const { assignedStylists, unassignedOptions, loading, assignedPagination, unassignedPagination } =
    useAppSelector((state) => state.stylistBranch);

  const [searchAssigned, setSearchAssigned] = useState('');
  const [currentPageAssigned, setCurrentPageAssigned] = useState(1);

  const [searchUnassigned, setSearchUnassigned] = useState('');
  const [currentPageUnassigned, setCurrentPageUnassigned] = useState(1);

  useEffect(() => {
    if (open && branchId) {
      dispatch(
        fetchBranchStylistsPaginated({
          branchId,
          page: currentPageAssigned,
          limit: ITEMS_PER_PAGE,
          search: searchAssigned || undefined,
        }),
      );
    }
  }, [open, branchId, dispatch, currentPageAssigned, searchAssigned]);

  useEffect(() => {
    if (open && branchId) {
      dispatch(
        fetchUnassignedStylistsPaginated({
          branchId,
          page: currentPageUnassigned,
          limit: ITEMS_PER_PAGE,
          search: searchUnassigned || undefined,
        }),
      );
    }
  }, [open, branchId, dispatch, currentPageUnassigned, searchUnassigned]);

  const handleSearchAssignedChange = (value: string) => {
    setSearchAssigned(value);
    setCurrentPageAssigned(1);
  };

  const handleSearchUnassignedChange = (value: string) => {
    setSearchUnassigned(value);
    setCurrentPageUnassigned(1);
  };

  const handleAssignClick = async (stylistId: string, stylistName: string) => {
    const confirmed = await showConfirm(
      'Assign Stylist?',
      `Assign ${stylistName} to this branch?`,
      'Assign',
      'Cancel',
      '#10B981',
    );

    if (!confirmed) return;

    showLoading('Assigning...');
    const result = await dispatch(assignStylist({ branchId, stylistId }));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Assigned', 'Stylist assigned successfully');

      // Refresh both lists
      dispatch(
        fetchBranchStylistsPaginated({
          branchId,
          page: currentPageAssigned,
          limit: ITEMS_PER_PAGE,
          search: searchAssigned || undefined,
        }),
      );
      dispatch(
        fetchUnassignedStylistsPaginated({
          branchId,
          page: currentPageUnassigned,
          limit: ITEMS_PER_PAGE,
          search: searchUnassigned || undefined,
        }),
      );
    } else {
      showError('Failed', 'Could not assign stylist');
    }
  };

  const handleUnassignClick = async (stylistId: string, stylistName: string) => {
    const confirmed = await showConfirm(
      'Unassign Stylist?',
      `Remove ${stylistName} from this branch?`,
      'Unassign',
      'Cancel',
      '#ef4444',
    );

    if (!confirmed) return;

    showLoading('Unassigning...');
    const result = await dispatch(unassignStylist({ branchId, stylistId }));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Unassigned', 'Stylist removed successfully');
      dispatch(
        fetchBranchStylistsPaginated({
          branchId,
          page: currentPageAssigned,
          limit: ITEMS_PER_PAGE,
          search: searchAssigned || undefined,
        }),
      );
      dispatch(
        fetchUnassignedStylistsPaginated({
          branchId,
          page: currentPageUnassigned,
          limit: ITEMS_PER_PAGE,
          search: searchUnassigned || undefined,
        }),
      );
    } else {
      showError('Failed', 'Could not unassign stylist');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setSearchAssigned('');
          setCurrentPageAssigned(1);
          setSearchUnassigned('');
          setCurrentPageUnassigned(1);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto theme-admin">
        <DialogHeader>
          <DialogTitle>Manage Stylists</DialogTitle>
          <DialogDescription>
            {branchName || `Branch ${branchId}`} - Assign or remove stylists from this branch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* ✅ SECTION 1: Unassigned Stylists (Available for Assignment) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Available Stylists</h3>
              <Input
                placeholder="Search available stylists..."
                value={searchUnassigned}
                onChange={(e) => handleSearchUnassignedChange(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {unassignedOptions.length} of {unassignedPagination.totalItems} stylists
              available
            </p>

            {/* Available Stylists Table */}
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading available stylists...
              </div>
            ) : unassignedOptions.length === 0 ? (
              <div className="py-8 text-center border rounded-lg text-muted-foreground bg-muted/30">
                {searchUnassigned
                  ? 'No matching stylists found'
                  : 'No stylists available for assignment'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        {/* <TableHead>Status</TableHead> */}
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedOptions.map((stylist) => (
                        <TableRow key={stylist.stylistId}>
                          <TableCell className="font-medium">{stylist.name}</TableCell>
                          <TableCell>{stylist.specialization}</TableCell>
                          <TableCell>{stylist.experience} yrs</TableCell>
                          {/* <TableCell>
                            <Badge
                              variant={
                                stylist.stylistStatus === 'ACTIVE' ? 'default' : 'destructive'
                              }
                            >
                              {stylist.stylistStatus}
                            </Badge>
                          </TableCell> */}
                          <TableCell className="text-right">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAssignClick(stylist.stylistId, stylist.name)}
                            >
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination for Unassigned */}
                {unassignedPagination.totalPages > 1 && (
                  <div className="pt-4 border-t">
                    <Pagination
                      currentPage={unassignedPagination.currentPage}
                      totalPages={unassignedPagination.totalPages}
                      onPageChange={setCurrentPageUnassigned}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ✅ SECTION 2: Assigned Stylists (Already Working at Branch) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Assigned Stylists</h3>
              <Input
                placeholder="Search assigned stylists..."
                value={searchAssigned}
                onChange={(e) => handleSearchAssignedChange(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Total: {assignedPagination.totalItems} stylists assigned to this branch
            </p>

            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading assigned stylists...
              </div>
            ) : assignedStylists.length === 0 ? (
              <div className="py-8 text-center border rounded-lg text-muted-foreground bg-muted/30">
                {searchAssigned ? 'No matching stylists found' : 'No stylists assigned yet'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        {/* <TableHead>Status</TableHead> */}
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedStylists.map((stylist) => (
                        <TableRow key={stylist.stylistId}>
                          <TableCell className="font-medium">{stylist.name}</TableCell>
                          <TableCell>{stylist.specialization}</TableCell>
                          <TableCell>{stylist.experience} yrs</TableCell>
                          {/* <TableCell>
                            <Badge
                              variant={
                                stylist.stylistStatus === 'ACTIVE' ? 'default' : 'destructive'
                              }
                            >
                              {stylist.stylistStatus}
                            </Badge>
                          </TableCell> */}
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUnassignClick(stylist.stylistId, stylist.name)}
                            >
                              Unassign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination for Assigned */}
                {assignedPagination.totalPages > 1 && (
                  <div className="pt-4 border-t">
                    <Pagination
                      currentPage={assignedPagination.currentPage}
                      totalPages={assignedPagination.totalPages}
                      onPageChange={setCurrentPageAssigned}
                    />
                  </div>
                )}
              </>
            )}
          </div>
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
