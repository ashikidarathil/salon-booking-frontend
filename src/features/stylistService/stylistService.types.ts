export interface StylistServiceItem {
  serviceId: string;
  name: string;
  categoryName: string;
  isActive: boolean;
  configured: boolean;
  createdAt?: string;
}

export interface StylistServiceState {
  services: StylistServiceItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ToggleStylistServicePayload {
  stylistId: string;
  serviceId: string;
  isActive: boolean;
}

export interface FetchStylistServicesParams {
  stylistId: string;
  page?: number;
  limit?: number;
  search?: string;
  configured?: boolean;
  isActive?: boolean;
}
