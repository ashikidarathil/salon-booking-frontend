export interface Shift {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface StylistBreak {
  id: string;
  stylistId: string;
  branchId: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStylistBreakDto {
  stylistId: string;
  branchId: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface WeeklySchedule {
  id: string;
  stylistId: string;
  branchId: string;
  dayOfWeek: number; // 0-6
  isWorkingDay: boolean;
  shifts: Shift[];
}

export interface DailyOverride {
  id: string;
  stylistId: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  isWorkingDay: boolean;
  shifts: Shift[];
  reason?: string;
}

export interface UpdateWeeklyScheduleDto {
  stylistId: string;
  branchId: string;
  isWorkingDay: boolean;
  shifts: Shift[];
}

export interface CreateDailyOverrideDto {
  stylistId: string;
  branchId: string;
  date: string;
  isWorkingDay: boolean;
  shifts: Shift[];
  reason?: string;
}
