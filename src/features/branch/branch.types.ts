export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  isDeleted: boolean;
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

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
