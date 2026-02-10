import type { PaginationMetadata } from '@/common/types/pagination.metadata';

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface UserState {
  users: UserListItem[];
  pagination: PaginationMetadata | null;
  loading: boolean;
  error: string | null;
}
