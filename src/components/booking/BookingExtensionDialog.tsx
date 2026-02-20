'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { fetchBranchServices } from '@/features/branchService/branchService.thunks';
import { extendBooking } from '@/features/booking/booking.thunks';
import { showSuccess, showError } from '@/common/utils/swal.utils';
import { cn } from '@/lib/utils';
import type { BranchServiceItem } from '@/features/branchService/branchService.types';
import type { BookingItem } from '@/features/booking/booking.types';

interface BookingExtensionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingItem | null;
}

export const BookingExtensionDialog: React.FC<BookingExtensionDialogProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const dispatch = useAppDispatch();
  const { services, loading: servicesLoading } = useAppSelector((state) => state.branchService);
  const { loading: bookingLoading } = useAppSelector((state) => state.booking);

  const [selectedService, setSelectedService] = useState<BranchServiceItem | null>(null);

  useEffect(() => {
    if (isOpen && booking?.branchId) {
      dispatch(fetchBranchServices(booking.branchId));
    }
  }, [isOpen, booking?.branchId, dispatch]);

  const handleExtend = async () => {
    if (!booking || !selectedService) return;

    try {
      const resultAction = await dispatch(
        extendBooking({
          bookingId: booking.id,
          additionalDuration: selectedService.duration,
        })
      );

      if (extendBooking.fulfilled.match(resultAction)) {
        showSuccess('Booking Extended!', `The booking has been extended by ${selectedService.duration} mins.`);
        onClose();
      } else {
        showError('Extension Failed', resultAction.payload as string || 'Could not extend booking.');
      }
    } catch (err) {
      showError('Error', 'An unexpected error occurred.');
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Icon icon="solar:Add-circle-bold" className="text-primary size-6" />
            Add Service / Extend
          </DialogTitle>
          <DialogDescription>
            Extend the current booking for <strong>{booking.startTime}</strong> by adding another service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center text-sm">
            <div>
              <p className="text-muted-foreground">Current End Time</p>
              <p className="font-bold">{booking.endTime}</p>
            </div>
            <Icon icon="solar:arrow-right-bold" className="text-muted-foreground" />
            <div className="text-right">
              <p className="text-muted-foreground">New End Time</p>
              <p className="font-bold text-primary">
                {selectedService ? 'Calculating...' : booking.endTime}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Select Service to Add</p>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {servicesLoading ? (
                <div className="flex justify-center py-8">
                  <Icon icon="eos-icons:loading" className="size-8 animate-spin text-primary" />
                </div>
              ) : (
                services.filter(s => s.isActive).map((service) => (
                  <div
                    key={service.serviceId}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:border-primary',
                      selectedService?.serviceId === service.serviceId
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border'
                    )}
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.duration} mins • ₹{service.price}</p>
                    </div>
                    {selectedService?.serviceId === service.serviceId && (
                      <Badge className="bg-primary">Selected</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={bookingLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleExtend}
            disabled={!selectedService || bookingLoading}
            className="bg-primary text-white"
          >
            {bookingLoading && <Icon icon="eos-icons:loading" className="mr-2 animate-spin" />}
            Confirm Extension
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
