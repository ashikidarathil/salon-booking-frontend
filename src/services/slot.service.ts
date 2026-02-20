import { api } from '@/services/api/api';
import type { AxiosResponse } from 'axios';

export interface Slot {
  id: string;
  branchId: string;
  stylistId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'LOCKED';
  stylistName?: string;
  stylistEmail?: string;
}

export interface ListSlotsParams {
  branchId: string;
  date: string;
  stylistId?: string;
  serviceId?: string;
}

class SlotService {
  async listAvailableSlots(params: ListSlotsParams): Promise<AxiosResponse<{ data: Slot[] }>> {
    return api.get('/availability', { params });
  }

  async adminListSlots(params: ListSlotsParams): Promise<AxiosResponse<{ data: Slot[] }>> {
    return api.get('/availability', { params });
  }

  async getStylistSlots(params: { branchId: string; date: string; stylistId?: string }): Promise<AxiosResponse<{ data: Slot[] }>> {
    return api.get('/availability', { params });
  }

  async blockSlot(slotId: string, reason?: string): Promise<AxiosResponse<{ data: Slot }>> {
    return api.patch(`/slots/${slotId}/block`, { reason });
  }

  async unblockSlot(slotId: string): Promise<AxiosResponse<{ data: Slot }>> {
    return api.patch(`/slots/${slotId}/unblock`);
  }

  async lockSlot(slotId: string): Promise<AxiosResponse<{ data: Slot }>> {
    return api.post(`/slots/${slotId}/lock`);
  }
}

export const slotService = new SlotService();
