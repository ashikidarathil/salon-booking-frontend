export enum OffDayStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface OffDay {
  id: string;
  stylistId: string;
  stylistName?: string;
  branchId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: OffDayStatus;
  adminRemarks?: string;
  createdAt: string;
}

export interface RequestOffDayDto {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateOffDayStatusDto {
  status: OffDayStatus;
  adminRemarks?: string;
}
