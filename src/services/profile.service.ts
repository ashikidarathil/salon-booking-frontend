import { api } from './api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse, SuccessMessageResponse } from '@/common/types/api.types';

export interface ProfilePictureResponse {
  profilePicture: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileService = {
  uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return api.post<ApiResponse<ProfilePictureResponse>>(
      API_ROUTES.PROFILE.UPLOAD_PICTURE,
      formData,
    );
  },

  updateProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return api.put<ApiResponse<ProfilePictureResponse>>(
      API_ROUTES.PROFILE.UPDATE_PICTURE,
      formData,
    );
  },

  updateProfile(data: UpdateProfilePayload) {
    return api.put<ApiResponse<SuccessMessageResponse>>(API_ROUTES.PROFILE.UPDATE_PROFILE, data);
  },

  changePassword(data: ChangePasswordPayload) {
    return api.post<ApiResponse<SuccessMessageResponse>>(API_ROUTES.PROFILE.CHANGE_PASSWORD, data);
  },
};
