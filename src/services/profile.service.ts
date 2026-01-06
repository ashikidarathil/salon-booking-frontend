// frontend/src/services/profile.service.ts

import { api } from './api';

export type ProfilePictureResponse = {
  profilePicture: string;
};

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const profileService = {
  uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return api.post<{ success: boolean; data: ProfilePictureResponse }>(
      '/auth/profile/upload-picture',
      formData,
    );
  },

  updateProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return api.put<{ success: boolean; data: ProfilePictureResponse }>(
      '/auth/profile/update-picture',
      formData,
    );
  },

  updateProfile(data: UpdateProfilePayload) {
    return api.put<{ success: boolean; data: { message: string } }>('/auth/profile/update', data);
  },

  changePassword(data: ChangePasswordPayload) {
    return api.post<{ success: boolean; data: { message: string } }>(
      '/auth/profile/change-password',
      data,
    );
  },
};
