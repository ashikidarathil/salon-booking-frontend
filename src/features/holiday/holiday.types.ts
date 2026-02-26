export interface Holiday {
  id: string;
  branchId?: string | null;
  branchName?: string;
  date: string;
  name: string;
  isAllBranches: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayDto {
  branchId?: string | null;
  date: string;
  name: string;
  isAllBranches: boolean;
}

export interface HolidayState {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
}
