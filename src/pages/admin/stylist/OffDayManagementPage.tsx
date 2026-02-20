import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAllOffDays, updateOffDayStatus } from '@/features/offDay/offDay.thunks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { OffDayStatus } from '@/features/offDay/offDay.types';

export default function OffDayManagementPage() {
  const dispatch = useAppDispatch();
  const { allOffDays, loading } = useAppSelector((state) => state.offDay);
  const [remark, setRemark] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchAllOffDays());
  }, [dispatch]);

  const handleStatusUpdate = async (id: string, status: OffDayStatus) => {
    try {
      await dispatch(
        updateOffDayStatus({
          offDayId: id,
          data: { status, adminRemarks: remark[id] },
        }),
      ).unwrap();
      toast.success(`Request ${status.toLowerCase()}`);
    } catch (error: unknown) {
      toast.error((error as string) || 'Failed to update status');
    }
  };

  const getStatusColor = (status: OffDayStatus) => {
    switch (status) {
      case OffDayStatus.APPROVED:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case OffDayStatus.REJECTED:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const pendingRequests = allOffDays.filter((o) => o.status === OffDayStatus.PENDING);
  const historyRequests = allOffDays.filter((o) => o.status !== OffDayStatus.PENDING);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Off-Day Management</h2>
        <p className="text-muted-foreground">Review and manage leave requests from stylists.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
          <CardDescription>Requests awaiting your decision.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No pending requests</p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="font-bold text-lg">{request.stylistName || 'Stylist'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.startDate), 'PPP')} -{' '}
                        {format(new Date(request.endDate), 'PPP')}
                      </p>
                      <p className="mt-2 text-sm bg-accent/30 p-2 rounded italic">
                        "{request.reason}"
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                        onClick={() => handleStatusUpdate(request.id, OffDayStatus.APPROVED)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleStatusUpdate(request.id, OffDayStatus.REJECTED)}
                        disabled={loading}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder="Add remarks (optional)"
                    value={remark[request.id] || ''}
                    onChange={(e) => setRemark({ ...remark, [request.id]: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>Previously processed requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-left font-medium">Stylist</th>
                  <th className="px-4 py-3 text-left font-medium">Period</th>
                  <th className="px-4 py-3 text-left font-medium">Status/Remarks</th>
                  <th className="px-4 py-3 text-right font-medium">Processed On</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {historyRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-accent/5">
                    <td className="px-4 py-3 font-medium">{request.stylistName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(request.startDate), 'MMM d')} -{' '}
                      {format(new Date(request.endDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className={`w-fit ${getStatusColor(request.status)}`}
                        >
                          {request.status}
                        </Badge>
                        {request.adminRemarks && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {request.adminRemarks}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {request.createdAt ? format(new Date(request.createdAt), 'MMM d, p') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
