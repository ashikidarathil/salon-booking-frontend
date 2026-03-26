export interface Shift {
  id?: string;
  startTime: string;
  endTime: string;
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
  id?: string;
  dayOfWeek: number;
  isWorkingDay: boolean;
  shifts: Shift[];
}

export interface DailyOverride {
  id: string;
  date: string;
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

export interface ScheduleState {
  weeklySchedule: WeeklySchedule[];
  dailyOverrides: DailyOverride[];
  breaks: StylistBreak[];
  loading: boolean;
  error: string | null;
}
