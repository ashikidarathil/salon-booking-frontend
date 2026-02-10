import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export interface BranchCategoryItem {
  branchId: string;
  categoryId: string;
  name: string;
  isActive: boolean;
}

export interface BranchCategoryState {
  categories: BranchCategoryItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}
