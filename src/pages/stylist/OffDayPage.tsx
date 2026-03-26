import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyOffDays, requestOffDay, deleteOffDay } from '@/features/offDay/offDay.thunks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/react';
import { format, startOfToday, addDays } from 'date-fns';
import { OffDayStatus, OffDayType } from '@/features/offDay/offDay.types';
import { Badge } from '@/components/ui/badge';
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
  showConfirm,
} from '@/common/utils/swal.utils';
import { cn } from '@/lib/utils';
import { OFF_DAY_MESSAGES } from '@/features/offDay/offDay.constants';

export default function OffDayPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myOffDays, loading } = useAppSelector((state) => state.offDay);
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(startOfToday(), 3));
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(startOfToday(), 3));
  const [reason, setReason] = useState('');
  const [selectedType, setSelectedType] = useState<OffDayType>(OffDayType.PERSONAL);

  useEffect(() => {
    dispatch(fetchMyOffDays());
  }, [dispatch]);

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      showError('Required Fields', 'Please fill in all fields before submitting.');
      return;
    }

    // Validation: 3-day advance notice
    const today = startOfToday();
    const minDate = addDays(today, 3);

    if (startDate < minDate) {
      showError('Notice Period', 'Leave requests must be made at least 3 days in advance.');
      return;
    }

    if (!user?.branchId) {
      showError(
        'Branch Required',
        'Your profile is not associated with a branch. Please contact Admin.',
      );
      return;
    }

    showLoading('Submitting leave request...');
    try {
      await dispatch(
        requestOffDay({
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          reason,
          branchId: user.branchId,
          type: selectedType,
        }),
      ).unwrap();
      showSuccess('Request Submitted', OFF_DAY_MESSAGES.REQUEST_SUCCESS);
      setReason('');
      setStartDate(addDays(startOfToday(), 3));
      setEndDate(addDays(startOfToday(), 3));
      setSelectedType(OffDayType.PERSONAL);
    } catch (error: unknown) {
      closeLoading();
      showError('Submission Failed', (error as string) || OFF_DAY_MESSAGES.REQUEST_ERROR);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      'Cancel Request?',
      'Are you sure you want to withdraw this leave request?',
    );

    if (!confirmed) return;

    showLoading('Cancelling request...');
    try {
      await dispatch(deleteOffDay(id)).unwrap();
      showSuccess('Cancelled', OFF_DAY_MESSAGES.DELETE_SUCCESS);
    } catch (error: unknown) {
      closeLoading();
      showError('Error', (error as string) || OFF_DAY_MESSAGES.DELETE_ERROR);
    }
  };

  return (
    <div className="space-y-6 max-w-8xl mx-auto px-4 py-8 rounded-lg bg-muted/40 border border-border/40 transition-all hover:shadow-md p-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 text-slate-800">
            <Icon icon="solar:tea-cup-bold" className="size-8 text-primary/80" />
            Time Off & Leave
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your breaks, holidays, or emergency leaves.
          </p>
        </div>
        <Badge variant="secondary" className="font-medium px-3 py-1 rounded-full text-xs">
          Leave Management
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Request Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="solar:pen-new-square-bold" className="text-primary size-5" />
                New Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 ml-1">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl justify-start text-left font-normal border-slate-200 hover:bg-slate-50"
                      >
                        <Icon icon="solar:calendar-bold" className="mr-2 size-4 text-slate-400" />
                        {startDate ? format(startDate, 'MMM d, yyyy') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl shadow-lg border-slate-200">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={{ before: addDays(startOfToday(), 3) }}
                        className="p-3 theme-stylist"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 ml-1">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl justify-start text-left font-normal border-slate-200 hover:bg-slate-50"
                      >
                        <Icon icon="solar:calendar-bold" className="mr-2 size-4 text-slate-400" />
                        {endDate ? format(endDate, 'MMM d, yyyy') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl shadow-lg border-slate-200">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={{ before: startDate || addDays(startOfToday(), 3) }}
                        className="p-3 theme-stylist"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: OffDayType.PERSONAL, label: 'Personal', icon: 'solar:user-bold' },
                    {
                      id: OffDayType.SICK_LEAVE,
                      label: 'Sick Leave',
                      icon: 'solar:medical-kit-bold',
                    },
                    { id: OffDayType.VACATION, label: 'Vacation', icon: 'solar:palmtree-bold' },
                    { id: OffDayType.EMERGENCY, label: 'Emergency', icon: 'solar:danger-bold' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all',
                        selectedType === type.id
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600',
                      )}
                    >
                      <Icon
                        icon={type.icon}
                        className={cn(
                          'size-4',
                          selectedType === type.id ? 'text-primary' : 'text-slate-400',
                        )}
                      />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Reason</label>
                <textarea
                  placeholder="Reason for your leave..."
                  className="w-full min-h-[100px] px-4 py-3 rounded-xl text-sm border border-slate-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none transition-all"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button
                className="w-full h-12 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all mt-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <Icon icon="eos-icons:loading" className="mr-2 size-4 animate-spin" />
                ) : (
                  <Icon icon="solar:paper-plane-bold" className="mr-2 size-4" />
                )}
                Submit Request
              </Button>
            </CardContent>
          </Card>

          {/* Info Notice */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400">
              <Icon icon="solar:info-square-bold" className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Notice Policy</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Requests must be made 3 days in advance. Approved leaves automatically block your
                calendar slots.
              </p>
            </div>
          </div>
        </div>

        {/* Request History */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden h-full">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Icon icon="solar:history-bold" className="text-primary size-5" />
                  Request History
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-medium text-slate-400">
                  {myOffDays.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {myOffDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-3">
                  <Icon icon="solar:document-text-bold-duotone" className="size-12 opacity-20" />
                  <p className="text-sm font-medium">No history found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myOffDays.map((offDay) => (
                    <div
                      key={offDay.id}
                      className="p-5 hover:bg-slate-50 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'size-10 rounded-xl flex items-center justify-center',
                            offDay.status === OffDayStatus.APPROVED
                              ? 'bg-green-50 text-green-600'
                              : offDay.status === OffDayStatus.REJECTED
                                ? 'bg-red-50 text-red-600'
                                : 'bg-amber-50 text-amber-600',
                          )}
                        >
                          <Icon
                            icon={
                              offDay.status === OffDayStatus.APPROVED
                                ? 'solar:check-circle-bold'
                                : offDay.status === OffDayStatus.REJECTED
                                  ? 'solar:close-circle-bold'
                                  : 'solar:clock-circle-bold'
                            }
                            className="size-5"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm text-slate-800">
                            {format(new Date(offDay.startDate), 'MMM d')} -{' '}
                            {format(new Date(offDay.endDate), 'MMM d, yyyy')}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                              {offDay.type}
                            </span>
                            <span className="size-1 rounded-full bg-slate-200" />
                            <span
                              className={cn(
                                'text-[10px] font-semibold uppercase',
                                offDay.status === OffDayStatus.APPROVED
                                  ? 'text-green-600'
                                  : offDay.status === OffDayStatus.REJECTED
                                    ? 'text-red-600'
                                    : 'text-amber-600',
                              )}
                            >
                              {offDay.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">
                            "{offDay.reason}"
                          </p>
                          {offDay.adminRemarks && (
                            <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-slate-100/50 rounded-lg border border-slate-100 text-[10px] text-slate-500 font-medium italic animate-in fade-in slide-in-from-top-1 duration-300">
                              <Icon
                                icon="solar:chat-round-dots-bold"
                                className="size-3 text-slate-400"
                              />
                              <span className="truncate">Admin: {offDay.adminRemarks}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {offDay.status === OffDayStatus.PENDING && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => handleDelete(offDay.id)}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
