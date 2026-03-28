export enum OffDayStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum OffDayType {
  SICK_LEAVE = 'SICK_LEAVE',
  VACATION = 'VACATION',
  PERSONAL = 'PERSONAL',
  EMERGENCY = 'EMERGENCY',
}

export interface OffDay {
  id: string;
  stylistId: string;
  stylistName?: string;
  branchId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: OffDayType;
  reason: string;
  status: OffDayStatus;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestOffDayDto {
  stylistId: string;
  startDate: string;
  endDate: string;
  reason: string;
  branchId: string;
  type: OffDayType;
}

export interface UpdateOffDayStatusDto {
  status: OffDayStatus;
  adminRemarks?: string;
}
