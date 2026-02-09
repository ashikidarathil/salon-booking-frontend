export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export interface SuccessMessageResponse {
  message: string;
}
export interface SuccessResponse {
  success: boolean;
}

export interface InviteLinkResponse {
  inviteLink: string;
  userId: string;
}

export interface ToggleBlockResponse {
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
