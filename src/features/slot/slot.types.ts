export interface SlotItem {
  id: string;
  branchId: string;
  stylistId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'LOCKED';
}

export interface SlotState {
  availableSlots: SlotItem[];
  loading: boolean;
  error: string | null;
  lastLockedSlot: SlotItem | null;
}
