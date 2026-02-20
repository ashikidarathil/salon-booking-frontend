import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { fetchBranchStylists } from '@/features/stylistBranch/stylistBranch.thunks';
import { fetchAvailableSlots, lockSlot } from '@/features/slot/slot.thunks';
import { resetBookingSuccess } from '@/features/booking/booking.slice';
import { createBooking as submitBookingThunk } from '@/features/booking/booking.thunks';
import { showSuccess } from '@/common/utils/swal.utils';
import { cn } from '@/lib/utils';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isBefore,
  startOfToday,
} from 'date-fns';
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';
import type { SlotItem } from '@/features/slot/slot.types';

interface SlotBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
}

export const SlotBookingDialog: React.FC<SlotBookingDialogProps> = ({
  isOpen,
  onClose,
  branchId,
  serviceId,
  serviceName,
  duration,
  price,
}) => {
  const dispatch = useAppDispatch();
  const { assignedStylists, loading: stylistsLoading } = useAppSelector(
    (state) => state.stylistBranch,
  );
  const { availableSlots, loading: slotsLoading } = useAppSelector((state) => state.slot);
  const { bookingSuccess, loading: bookingLoading } = useAppSelector((state) => state.booking);

  const [step, setStep] = useState(1);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));

  useEffect(() => {
    if (isOpen && branchId) {
      dispatch(fetchBranchStylists(branchId));
    }
  }, [isOpen, branchId, dispatch]);

  useEffect(() => {
    if (step === 3 && selectedStylist && selectedDate) {
      dispatch(
        fetchAvailableSlots({
          branchId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          stylistId: selectedStylist,
          serviceId,
        }),
      );
    }
  }, [step, selectedStylist, selectedDate, branchId, dispatch]);

  const resetForm = () => {
    setStep(1);
    setSelectedStylist(null);
    setSelectedDate(startOfToday());
    setSelectedSlot(null);
  };

  useEffect(() => {
    if (bookingSuccess) {
      showSuccess('Booking Confirmed!', `Your appointment for ${serviceName} has been booked.`);
      onClose();
      dispatch(resetBookingSuccess());
      // Defer reset to avoid synchronous state update in effect
      setTimeout(() => resetForm(), 0);
    }
  }, [bookingSuccess, serviceName, onClose, dispatch]);

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfToday())) return;
    setSelectedDate(date);
    setStep(3);
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot) return;

    const lockResult = await dispatch(lockSlot(selectedSlot));
    if (lockResult.meta.requestStatus === 'fulfilled') {
      await dispatch(submitBookingThunk({ slotId: selectedSlot, serviceId }));
    }
  };

  const renderStylists = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {assignedStylists.map((stylist: BranchStylist) => (
        <div
          key={stylist.userId}
          onClick={() => {
            setSelectedStylist(stylist.userId);
            setStep(2);
          }}
          className={cn(
            'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-primary/5',
            selectedStylist === stylist.userId
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border',
          )}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 text-accent">
            <Icon icon="solar:user-bold" className="size-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{stylist.name}</p>
            <p className="text-xs text-muted-foreground">
              {stylist.specialization || 'Professional Stylist'}
            </p>
          </div>
        </div>
      ))}
      {assignedStylists.length === 0 && !stylistsLoading && (
        <div className="col-span-2 py-8 text-center text-muted-foreground">
          No stylists available for this branch.
        </div>
      )}
    </div>
  );

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const isDisabled = isBefore(day, startOfToday());
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              'relative flex items-center justify-center h-10 w-full rounded-md text-sm transition-all cursor-pointer',
              !isCurrentMonth && 'text-muted-foreground/30',
              isDisabled && 'cursor-not-allowed opacity-30',
              isSelected && 'bg-primary text-white font-bold shadow-md',
              !isDisabled && !isSelected && 'hover:bg-primary/10 hover:text-primary',
            )}
            onClick={() => !isDisabled && handleDateSelect(cloneDay)}
          >
            {formattedDate}
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="p-2 border rounded-xl bg-card">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <Icon icon="lucide:chevron-left" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <Icon icon="lucide:chevron-right" className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-muted-foreground uppercase py-1"
            >
              {d}
            </div>
          ))}
        </div>
        <div>{rows}</div>
      </div>
    );
  };

  const renderSlots = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {format(selectedDate, 'EEEE, dd MMMM')}
        </p>
        <Badge variant="outline" className="text-xs">
          {availableSlots.length} Slots Available
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {availableSlots.map((slot: SlotItem) => (
          <Button
            key={slot.id}
            variant={selectedSlot === slot.id ? 'default' : 'outline'}
            className={cn(
              'h-12 text-sm font-medium transition-all',
              selectedSlot === slot.id
                ? 'shadow-md ring-2 ring-primary ring-offset-2'
                : 'hover:border-primary hover:text-primary',
            )}
            onClick={() => setSelectedSlot(slot.id)}
          >
            {slot.startTime}
          </Button>
        ))}
      </div>

      {availableSlots.length === 0 && !slotsLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
          <Icon icon="solar:calendar-minimalistic-bold" className="size-12 mb-2 opacity-20" />
          <p>No available slots for this date.</p>
          <Button variant="link" onClick={() => setStep(2)}>
            Choose another date
          </Button>
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => {
    const slot = availableSlots.find((s: SlotItem) => s.id === selectedSlot);
    const stylist = assignedStylists.find((s: BranchStylist) => s.userId === selectedStylist);

    return (
      <div className="space-y-6">
        <div className="p-6 space-y-4 border rounded-xl bg-accent/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                Service
              </p>
              <h4 className="text-xl font-bold text-foreground">{serviceName}</h4>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                Price
              </p>
              <h4 className="text-xl font-bold text-primary">₹{price}</h4>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Stylist
              </p>
              <div className="flex items-center gap-2">
                <Icon icon="solar:user-bold" className="text-primary size-4" />
                <p className="font-semibold">{stylist?.name}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Duration
              </p>
              <div className="flex items-center gap-2">
                <Icon icon="solar:clock-circle-bold" className="text-primary size-4" />
                <p className="font-semibold">{duration} mins {Math.ceil(duration / 15) * 15 > duration && <span className="text-[10px] text-accent font-normal">(Includes Buffer)</span>}</p>
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Date & Time
              </p>
              <div className="flex items-center gap-2">
                <Icon icon="solar:calendar-date-bold" className="text-primary size-4" />
                <p className="font-semibold">
                  {format(selectedDate, 'MMM dd, yyyy')} at {slot?.startTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full text-white shadow-lg h-12 text-lg font-bold bg-primary hover:bg-primary/90"
            onClick={handleBookingSubmit}
            disabled={bookingLoading}
          >
            {bookingLoading ? (
              <Icon icon="eos-icons:loading" className="mr-2 size-5 animate-spin" />
            ) : null}
            Confirm Booking
          </Button>
          <Button variant="ghost" onClick={() => setStep(3)}>
            Back to slots
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-2xl border-none shadow-2xl">
        <div className="relative p-6 bg-gradient-to-br from-primary/10 via-background to-background">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Step {step} of 4
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                {step === 1 && 'Choose Stylist'}
                {step === 2 && 'Select Date'}
                {step === 3 && 'Pick Time'}
                {step === 4 && 'Confirm Booking'}
              </span>
            </div>
            <DialogTitle className="text-3xl font-bold font-heading">
              {step === 1 && 'Select Your Stylist'}
              {step === 2 && 'Choose a Date'}
              {step === 3 && 'Available Slots'}
              {step === 4 && 'Review & Confirm'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Book an appointment for {serviceName} by selecting a stylist, date, and time slot.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto px-1">
            {step === 1 && renderStylists()}
            {step === 2 && renderCalendar()}
            {step === 3 && renderSlots()}
            {step === 4 && renderConfirmation()}
          </div>

          {step > 1 && step < 4 && (
            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="gap-2">
                <Icon icon="lucide:arrow-left" className="size-4" />
                Back
              </Button>
              {step === 3 && selectedSlot && (
                <Button
                  size="sm"
                  onClick={() => setStep(4)}
                  className="bg-primary text-white shadow-md"
                >
                  Review & Confirm
                  <Icon icon="lucide:arrow-right" className="ml-2 size-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
