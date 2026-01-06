import { api } from './api';

export interface UserListItem {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface ToggleBlockPayload {
  isBlocked: boolean;
}

export const userService = {
  getAllUsers() {
    return api.get<{ success: boolean; data: { users: UserListItem[] } }>('/admin/users');
  },

  toggleBlock(userId: string, isBlocked: boolean) {
    return api.patch(`/admin/users/${userId}/block`, { isBlocked });
  },
};
