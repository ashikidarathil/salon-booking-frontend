'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAllOffDays, updateOffDayStatus } from '@/features/offDay/offDay.thunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { OffDayStatus } from '@/features/offDay/offDay.types';
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
  showConfirm,
} from '@/common/utils/swal.utils';
import { cn } from '@/lib/utils';
import { OFF_DAY_MESSAGES } from '@/features/offDay/offDay.constants';

interface OffDayManagementProps {
  stylistId?: string;
  onClose?: () => void;
}

export default function OffDayManagement({ stylistId, onClose }: OffDayManagementProps) {
  const dispatch = useAppDispatch();
  const { allOffDays, loading } = useAppSelector((state) => state.offDay);
  const [remark, setRemark] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchAllOffDays());
  }, [dispatch]);

  const handleStatusUpdate = async (id: string, status: OffDayStatus) => {
    const action = status === OffDayStatus.APPROVED ? 'Approve' : 'Reject';
    const confirmed = await showConfirm(
      `${action} Request?`,
      `Are you sure you want to ${status.toLowerCase()} this leave request?`,
    );

    if (!confirmed) return;

    showLoading(`${action}ing request...`);
    try {
      await dispatch(
        updateOffDayStatus({
          offDayId: id,
          data: { status, adminRemarks: remark[id] },
        }),
      ).unwrap();
      showSuccess('Success', OFF_DAY_MESSAGES.UPDATE_STATUS_SUCCESS);
    } catch (error: unknown) {
      showError('Error', (error as string) || OFF_DAY_MESSAGES.UPDATE_STATUS_ERROR);
    } finally {
      closeLoading();
    }
  };

  const filteredOffDays = stylistId
    ? allOffDays.filter((o) => o.stylistId === stylistId)
    : allOffDays;

  const pendingRequests = filteredOffDays.filter((o) => o.status === OffDayStatus.PENDING);
  const historyRequests = filteredOffDays.filter((o) => o.status !== OffDayStatus.PENDING);

  return (
    <div className="space-y-6">
      <div className="space-y-6 bg-white p-10 border-2 rounded-2xl shadow-sm">
        {/* Component Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-slate-100"
              >
                <Icon icon="solar:arrow-left-linear" className="size-6 text-slate-500" />
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
                <Icon icon="solar:shield-user-bold" className="size-8 text-primary/80" />
                Off-Day Management
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Review and manage leave requests from the stylist team.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="font-semibold px-4 py-1.5 rounded-full text-xs">
            {pendingRequests.length} Pending Actions
          </Badge>
        </div>

        {/* Pending Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="solar:bill-list-bold-duotone" className="size-5 text-primary" />
            <h3 className="text-[10px] font-bold tracking-wider text-slate-400">
              Awaiting Approval
            </h3>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="border border-slate-200 shadow-sm rounded-2xl bg-slate-50/50">
              <CardContent className="py-12 text-center">
                <Icon
                  icon="solar:check-read-bold"
                  className="size-12 text-slate-200 mx-auto mb-3"
                />
                <p className="font-semibold text-slate-400">All caught up!</p>
                <p className="text-xs text-slate-400">No pending leave requests at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingRequests.map((request) => (
                <Card
                  key={request.id}
                  className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                        <Icon icon="solar:user-bold" className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {request.stylistName || 'Stylist'}
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 tracking-wider font-medium">
                          {request.type || 'Leave Request'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                        <Icon icon="solar:calendar-date-bold" className="size-4 text-slate-400" />
                        <div>
                          <p className="text-[9px] font-bold tracking-wider text-slate-400 mb-0.5 ml-1">
                            Requested Period
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {format(new Date(request.startDate), 'MMM d')} -{' '}
                            {format(new Date(request.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-wider text-slate-400 ml-1">
                          Reason
                        </label>
                        <div className="p-3 bg-slate-50/50 rounded-xl text-xs font-medium italic text-slate-600 border border-slate-100 leading-relaxed">
                          "{request.reason}"
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-wider text-slate-400 ml-1">
                          Admin Remark
                        </label>
                        <Input
                          placeholder="Add a remark (optional)..."
                          value={remark[request.id] || ''}
                          onChange={(e) => setRemark({ ...remark, [request.id]: e.target.value })}
                          className="h-10 rounded-lg border-slate-200 bg-white text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 h-10 rounded-lg text-xs font-semibold shadow-sm bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(request.id, OffDayStatus.APPROVED)}
                        disabled={loading}
                      >
                        <Icon icon="solar:check-circle-bold" className="mr-1.5 size-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-10 rounded-lg text-xs font-semibold text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        onClick={() => handleStatusUpdate(request.id, OffDayStatus.REJECTED)}
                        disabled={loading}
                      >
                        <Icon icon="solar:close-circle-bold" className="mr-1.5 size-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* History Section */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="solar:history-bold" className="size-5 text-slate-400" />
            <h3 className="text-[10px] font-bold tracking-wider text-slate-400">
              Application History
            </h3>
          </div>

          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b">
                      {!stylistId && (
                        <th className="px-6 py-4 text-left text-[10px] font-bold tracking-wider text-slate-500">
                          Stylist
                        </th>
                      )}
                      <th className="px-4 py-4 text-left text-[10px] font-bold tracking-wider text-slate-500">
                        Time Period
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-bold tracking-wider text-slate-500">
                        Status & Remarks
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold tracking-wider text-slate-500">
                        Processed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                        {!stylistId && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary text-xs font-bold">
                                {request.stylistName?.charAt(0) || 'S'}
                              </div>
                              <span className="font-semibold text-slate-700">
                                {request.stylistName}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-4 text-slate-600 font-medium">
                          {format(new Date(request.startDate), 'MMM d')} -{' '}
                          {format(new Date(request.endDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={cn(
                                'w-fit text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                request.status === OffDayStatus.APPROVED
                                  ? 'bg-green-50 text-green-600'
                                  : request.status === OffDayStatus.REJECTED
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-amber-50 text-amber-600',
                              )}
                            >
                              {request.status}
                            </span>
                            {request.adminRemarks && (
                              <p className="text-[11px] text-slate-500 italic max-w-[240px] truncate bg-white px-2 py-0.5 rounded border border-slate-100">
                                {request.adminRemarks}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-medium text-slate-400">
                          {request.createdAt
                            ? format(new Date(request.createdAt), 'MMM d, p')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {historyRequests.length === 0 && (
                <div className="py-10 text-center text-slate-300 text-sm font-medium">
                  No leave history recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
