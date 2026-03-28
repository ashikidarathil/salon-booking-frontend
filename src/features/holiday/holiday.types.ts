export interface Holiday {
  id: string;
  branchIds: string[];
  branchName?: string;
  date: string;
  name: string;
  isAllBranches: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayDto {
  branchIds?: string[];
  date: string;
  name: string;
  isAllBranches: boolean;
}

export interface HolidayState {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
}
