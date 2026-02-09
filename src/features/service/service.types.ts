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
  export interface PaginationMetadata {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
