'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Icon } from '@iconify/react';
import { format, isBefore, startOfDay } from 'date-fns';
import { showApiError } from '@/common/utils/swal.utils';
import type { SlotItem } from '@/features/slot/slot.types';
import { slotService } from '@/services/slot.service';
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';

interface SelectedService {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
}

interface SlotBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  selectedServices: SelectedService[];
  initialStylistId?: string;
  isCartMode?: boolean;
  availableStylists?: BranchStylist[];
  onSelect: (data: {
    stylistId: string;
    stylistName: string;
    date: string;
    startTime: string;
    slotId: string;
  }) => void;
}

export function SlotBookingDialog({
  isOpen,
  onClose,
  branchId,
  selectedServices,
  initialStylistId,
  availableStylists = [],
  onSelect,
}: SlotBookingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStylistId, setSelectedStylistId] = useState<string>(initialStylistId || '');
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Auto-select first stylist if only one is available or if initialStylistId is provided
  useEffect(() => {
    if (initialStylistId) {
      setSelectedStylistId(initialStylistId);
    } else if (availableStylists.length === 1) {
      setSelectedStylistId(availableStylists[0].userId);
    }
  }, [initialStylistId, availableStylists]);

  // Fetch slots when date or stylist changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedStylistId || !selectedDate || !branchId) return;

      setLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

        const response = await slotService.listAvailableSlots({
          branchId,
          stylistId: selectedStylistId,
          date: dateStr,
          duration: totalDuration,
        });

        if (response.data.success) {
          setSlots(response.data.data);
        } else {
          setSlots([]);
        }
      } catch (error: unknown) {
        console.error('Failed to fetch slots:', error);
        setSlots([]);
        const message = error instanceof Error ? error.message : 'Failed to fetch slots';
        showApiError(message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSlots();
    }
  }, [selectedStylistId, selectedDate, branchId, isOpen, selectedServices]);

  const handleConfirm = () => {
    const selectedSlot = slots.find((s) => s.id === selectedSlotId);
    const stylist = availableStylists.find((s) => s.userId === selectedStylistId);

    const resolvedStylistId = stylist?.userId || selectedStylistId;
    const resolvedStylistName = stylist?.name || '';

    if (selectedSlot && resolvedStylistId) {
      onSelect({
        stylistId: resolvedStylistId,
        stylistName: resolvedStylistName,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.startTime,
        slotId: selectedSlot.id,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none">
        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Left Side: Calendar and Stylist Selection */}
          <div className="flex-1 p-6 border-r border-border/50">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold font-heading">
                Book Appointment
              </DialogTitle>
              <DialogDescription>Select your preferred date and stylist</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  <Icon icon="solar:calendar-bold" className="text-primary" />
                  Choose Date
                </p>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-none"
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                />
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  <Icon icon="solar:user-bold" className="text-primary" />
                  Select Stylist
                </p>
                <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-1">
                  {availableStylists.length > 0 ? (
                    availableStylists.map((stylist) => (
                      <button
                        key={stylist.userId}
                        onClick={() => setSelectedStylistId(stylist.userId)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          selectedStylistId === stylist.userId
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border/60 hover:border-primary/40 bg-background'
                        }`}
                      >
                        <div className="size-8 rounded-full bg-muted overflow-hidden">
                          {stylist.profilePicture ? (
                            <img
                              src={stylist.profilePicture}
                              alt={stylist.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Icon
                              icon="solar:user-bold"
                              className="size-5 m-auto mt-1.5 text-muted-foreground/40"
                            />
                          )}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{stylist.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {stylist.specialization}
                          </p>
                        </div>
                        {selectedStylistId === stylist.userId && (
                          <Icon icon="solar:check-circle-bold" className="size-5 text-primary" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/20 rounded-xl border border-dashed border-border/60">
                      <Icon
                        icon="solar:users-group-two-rounded-broken"
                        className="size-8 text-muted-foreground/40 mb-2"
                      />
                      <p className="text-xs text-muted-foreground px-4">
                        No stylists assigned for the selected services at this branch.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Slot Selection */}
          <div className="md:w-80 bg-muted/10 p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold" className="text-primary" />
              Available Slots
            </h3>

            <div className="flex-1 min-h-[200px] mb-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground italic">
                  <Icon icon="eos-icons:loading" className="size-8 animate-spin" />
                  <p className="text-sm">Finding slots...</p>
                </div>
              ) : slots.length > 0 ? (
                <>
                  {slots.some((s) =>
                    ['OFF_DAY', 'NON_WORKING', 'NO_SCHEDULE', 'HOLIDAY'].includes(s.status),
                  ) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3 bg-red-50/30 rounded-2xl border border-red-100/50 py-8">
                      <Icon
                        icon="solar:calendar-minimalistic-broken"
                        className="size-12 text-red-400"
                      />
                      <div>
                        <p className="font-bold text-red-600">
                          {slots.find((s) => s.status === 'HOLIDAY')
                            ? 'Salon Holiday'
                            : slots.find((s) => s.status === 'OFF_DAY')
                              ? 'On Leave'
                              : 'Not Available'}
                        </p>
                        <p className="text-xs text-red-500/80 mt-1">
                          {slots.find((s) => s.status === 'HOLIDAY')
                            ? slots.find((s) => s.status === 'HOLIDAY')?.note ||
                              'The salon is closed today for a holiday.'
                            : 'Stylist is not available on this date.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {slots
                        .filter(
                          (slot) =>
                            (slot.startTime !== '00:00' || slot.status === 'AVAILABLE') &&
                            slot.status !== 'HOLIDAY',
                        )
                        .map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${
                              selectedSlotId === slot.id
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-background hover:border-primary/40 border-border/60'
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
                  <Icon
                    icon="solar:calendar-block-bold-duotone"
                    className="size-12 text-muted-foreground/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    No slots available for this date and stylist.
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 italic">
                    Try another date or stylist.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-4 pt-6 border-t border-border/40">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Services</span>
                  <span>{selectedServices.length} Items</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span className="text-primary truncate">
                    ₹
                    {(() => {
                      const selSlot = slots.find((s) => s.id === selectedSlotId);
                      const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
                      if (!selSlot || !selSlot.price || selSlot.price <= 0) return servicesTotal;
                      return selSlot.price;
                    })()}
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-12 font-bold shadow-lg shadow-primary/20"
                disabled={!selectedSlotId || !selectedStylistId || loading}
                onClick={handleConfirm}
              >
                Confirm Selection
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground"
                onClick={onClose}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
