export type SlotStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'BLOCKED'
  | 'BREAK'
  | 'OFF_DAY'
  | 'NON_WORKING'
  | 'NO_SCHEDULE'
  | 'HOLIDAY'
  | 'SPECIAL'
  | 'CANCELLED';

export interface SlotItem {
  id: string;
  branchId: string;
  stylistId: string;
  date: string;
  startTime: string;
  endTime: string;
  startTimeUTC?: string;
  status: SlotStatus;
  stylistName?: string;
  stylistEmail?: string;
  note?: string;
  price?: number;
  bookedServices?: string[];
}

export interface ListSlotsParams {
  branchId: string;
  date: string;
  stylistId?: string;
  serviceId?: string;
  duration?: number;
  includeAll?: boolean;
}

export interface SlotState {
  availableSlots: SlotItem[];
  loading: boolean;
  error: string | null;
}
