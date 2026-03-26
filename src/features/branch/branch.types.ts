import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  isDeleted: boolean;
  defaultBreaks?: Array<{
    startTime: string;
    endTime: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface NearestBranch extends Branch {
  distance: number;
}

export interface MapLocation {
  latitude: number;
  longitude: number;
}

export interface PlacesResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface BranchState {
  branches: Branch[];
  nearestBranches: Branch[];
  selectedBranch: Branch | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationMetadata;
}

export interface BranchQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isDeleted?: boolean;
}

export interface PaginatedBranchResponse {
  data: Branch[];
  pagination: PaginationMetadata;
}
