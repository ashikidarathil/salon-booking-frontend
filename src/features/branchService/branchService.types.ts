import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export interface BranchServiceItem {
  branchId: string;
  serviceId: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  duration: number;
  imageUrl?: string;
  description?: string;
  whatIncluded?: string[];
  isActive: boolean;
  configured: boolean;
}

export interface BranchServiceState {
  services: BranchServiceItem[];
  currentService: BranchServiceItem | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}
