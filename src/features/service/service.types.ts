import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

export interface Service {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  imageUrl?: string;
  whatIncluded?: string[];
  status: ServiceStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceState {
  services: Service[];
  loading: boolean;
  currentService: Service | null;
  imageLoading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}

export interface ServiceQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  status?: ServiceStatus;
  isDeleted?: boolean;
}

export interface PaginatedServiceResponse {
  data: Service[];
  pagination: PaginationMetadata;
}
