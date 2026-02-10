import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}