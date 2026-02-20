import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyOffDays, requestOffDay, deleteOffDay } from '@/features/offDay/offDay.thunks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { OffDayStatus } from '@/features/offDay/offDay.types';
import { Badge } from '@/components/ui/badge';

export default function OffDayPage() {
  const dispatch = useAppDispatch();
  const { myOffDays, loading } = useAppSelector((state) => state.offDay);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reason, setReason] = useState('');

  useEffect(() => {
    dispatch(fetchMyOffDays());
  }, [dispatch]);

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await dispatch(
        requestOffDay({
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          reason,
        }),
      ).unwrap();
      toast.success('Leave request submitted');
      setReason('');
    } catch (error: unknown) {
      toast.error((error as string) || 'Failed to submit request');
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Request Time Off</CardTitle>
            <CardDescription>Plan your holidays or personal time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Icon icon="solar:calendar-bold" className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Icon icon="solar:calendar-bold" className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={{ before: startDate || new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input
                placeholder="e.g. Family function, Vacation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              Submit Request
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Leave Requests</CardTitle>
            <CardDescription>Track status of your time off requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOffDays.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon
                    icon="solar:document-text-bold"
                    className="size-12 mx-auto opacity-20 mb-4"
                  />
                  <p>No leave requests found</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="px-4 py-3 text-left font-medium">Period</th>
                        <th className="px-4 py-3 text-left font-medium">Reason</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {myOffDays.map((offDay) => (
                        <tr key={offDay.id} className="hover:bg-accent/5">
                          <td className="px-4 py-3">
                            <p className="font-medium">
                              {format(new Date(offDay.startDate), 'MMM d')} -{' '}
                              {format(new Date(offDay.endDate), 'MMM d')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(offDay.startDate), 'yyyy')}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{offDay.reason}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={getStatusColor(offDay.status)}>
                              {offDay.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {offDay.status === OffDayStatus.PENDING && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive h-8 px-2"
                                onClick={() => dispatch(deleteOffDay(offDay.id))}
                              >
                                <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
