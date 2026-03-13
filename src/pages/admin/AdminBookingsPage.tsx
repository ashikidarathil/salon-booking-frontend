'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchAdminBookings,
  cancelBooking,
  rescheduleBooking,
} from '@/features/booking/booking.thunks';
import { fetchBranches } from '@/features/branch/branch.thunks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { LoadingGate } from '@/components/common/LoadingGate';
import { format } from 'date-fns';
import { showSuccess, showApiError, showCancellationConfirm } from '@/common/utils/swal.utils';
import Swal from 'sweetalert2';
import { SlotBookingDialog } from '@/components/booking/SlotBookingDialog';
import type { BookingItem, BookingDetailsItem } from '@/features/booking/booking.types';
import { BookingStatus, BOOKING_MESSAGES } from '@/features/booking/booking.constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminBookingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myBookings: bookings, loading, error } = useAppSelector((state) => state.booking);
  const { branches } = useAppSelector((state) => state.branch);

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Dialog states
  const [rescheduleData, setRescheduleData] = useState<{
    isOpen: boolean;
    booking: BookingItem | null;
  }>({ isOpen: false, booking: null });

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAdminBookings({
        branchId: selectedBranch === 'all' ? undefined : selectedBranch,
        date: selectedDate,
      }),
    );
  }, [dispatch, selectedBranch, selectedDate]);

  const handleCancel = async (booking: BookingItem) => {
    const reason = await showCancellationConfirm();
    if (reason) {
      const result = await dispatch(cancelBooking({ bookingId: booking.id, reason }));
      if (cancelBooking.fulfilled.match(result)) {
        showSuccess('Cancelled', BOOKING_MESSAGES.CANCEL_SUCCESS);
      }
    }
  };

  const handleRescheduleSubmit = async (data: {
    stylistId: string;
    date: string;
    startTime: string;
    slotId: string;
  }) => {
    if (!rescheduleData.booking) return;

    const { value: reason } = await Swal.fire({
      title: 'Reschedule Reason',
      input: 'text',
      inputPlaceholder: 'Reason for rescheduling...',
      showCancelButton: true,
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage('Reason is required');
        }
        return value;
      },
    });

    if (reason) {
      const result = await dispatch(
        rescheduleBooking({
          bookingId: rescheduleData.booking.id,
          data: {
            reason,
            items: rescheduleData.booking.items.map((item) => ({
              serviceId: item.serviceId,
              stylistId: data.stylistId,
              date: data.date,
              startTime: data.startTime,
              slotId: data.slotId,
            })),
          },
        }),
      );

      if (rescheduleBooking.fulfilled.match(result)) {
        showSuccess('Rescheduled', BOOKING_MESSAGES.RESCHEDULE_SUCCESS);
        setRescheduleData({ isOpen: false, booking: null });
      } else {
        showApiError(result.payload as string, 'Reschedule Failed');
      }
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status as string) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'NO_SHOW':
        return 'bg-gray-200 text-gray-600 border-gray-300';
      case 'SPECIAL':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'FAILED':
        return 'bg-red-50 text-red-500 border-red-100';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Booking Management</h1>
          <p className="text-muted-foreground">Monitor and manage all salon appointments</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <span className="ml-1 text-xs font-bold uppercase text-muted-foreground">Branch</span>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="bg-background border-border/60">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <span className="ml-1 text-xs font-bold uppercase text-muted-foreground">Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 px-3 text-sm border rounded-md bg-background border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            variant="outline"
            className="h-10 mt-5"
            onClick={() =>
              dispatch(
                fetchAdminBookings({
                  branchId: selectedBranch === 'all' ? undefined : selectedBranch,
                  date: selectedDate,
                }),
              )
            }
          >
            <Icon icon="solar:restart-bold" className="size-4" />
          </Button>
        </div>
      </div>

      <LoadingGate
        loading={loading}
        error={error}
        data={bookings}
        emptyMessage="No bookings found for the selected criteria."
      >
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden transition-all border-border/60 hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:hashtag-bold" className="size-4 text-primary" />
                        <span className="text-lg font-bold">
                          {booking.bookingNumber}
                        </span>
                        <Badge className={getStatusColor(booking.status)}>
                          {(booking.status as string) === 'SPECIAL' ? '⚡ Special' : booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="relative flex items-center gap-1 group">
                          <Icon icon="solar:user-bold" className="size-3.5 text-blue-500" />
                          <span className="font-medium text-foreground">
                            {booking.userName || `User ${booking.userId.slice(-6)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:buildings-bold" className="size-3" />
                          <span>
                            Branch:{' '}
                            {branches.find((b) => b.id === booking.branchId)?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                        Appointment Time
                      </p>
                      <p className="text-lg font-bold">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {booking.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 border-border/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center rounded-lg size-8 bg-primary/10">
                            <Icon
                              icon="solar:scissors-square-bold"
                              className="size-4 text-primary"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{item.serviceName}</p>
                            <p className="text-xs text-muted-foreground">
                              Stylist: {item.stylistName}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">₹{item.price}</p>
                      </div>
                    ))}
                  </div>

                  {booking.notes && (
                    <div className="p-3 mt-4 border border-yellow-100 rounded-lg bg-yellow-50/50">
                      <p className="text-[10px] font-bold uppercase text-yellow-700 mb-1">
                        Customer Notes
                      </p>
                      <p className="text-sm text-yellow-800">{booking.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-4 p-6 border-t bg-muted/10 lg:w-72 lg:border-t-0 lg:border-l border-border/40">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                        Payment
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                        Total Price
                      </p>
                      <p className="text-2xl font-black text-primary">₹{booking.totalPrice}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {booking.status === BookingStatus.CONFIRMED && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRescheduleData({ isOpen: true, booking })}
                        >
                          <Icon icon="solar:calendar-rotate-bold" className="mr-2 size-4" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-100 hover:bg-red-50"
                          onClick={() => handleCancel(booking)}
                        >
                          <Icon icon="solar:close-circle-bold" className="mr-2 size-4" />
                          Cancel Booking
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                    >
                      <Icon icon="solar:document-text-bold" className="mr-2 size-4" />
                      Full Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </LoadingGate>

      {rescheduleData.isOpen && rescheduleData.booking && (
        <SlotBookingDialog
          isOpen={rescheduleData.isOpen}
          onClose={() => setRescheduleData({ isOpen: false, booking: null })}
          branchId={rescheduleData.booking.branchId}
          selectedServices={rescheduleData.booking.items.map((i: BookingDetailsItem) => ({
            serviceId: i.serviceId,
            name: i.serviceName || 'Service',
            price: i.price,
            duration: i.duration,
          }))}
          isCartMode={true}
          onSelect={handleRescheduleSubmit}
        />
      )}
    </div>
  );
}
