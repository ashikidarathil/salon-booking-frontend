import { createAsyncThunk } from '@reduxjs/toolkit';
import { profileService, type UpdateProfileResponse } from '@/services/profile.service';
import type { UpdateProfilePayload, ChangePasswordPayload } from '@/services/profile.service';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';
import type { SuccessMessageResponse } from '@/common/types/api.types';
import { handleThunkError } from '@/common/utils/thunk.utils';

export interface ProfilePictureResponse {
  profilePicture: string;
}

export const uploadProfilePicture = createAsyncThunk<
  ProfilePictureResponse,
  File,
  { rejectValue: string }
>('profile/uploadProfilePicture', async (file, { rejectWithValue }) => {
  try {
    const res = await profileService.uploadProfilePicture(file);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const updateProfilePicture = createAsyncThunk<
  ProfilePictureResponse,
  File,
  { rejectValue: string }
>('profile/updateProfilePicture', async (file, { rejectWithValue }) => {
  try {
    const res = await profileService.updateProfilePicture(file);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const updateProfile = createAsyncThunk<
  UpdateProfileResponse,
  UpdateProfilePayload,
  { rejectValue: string }
>('profile/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await profileService.updateProfile(data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

export const changePassword = createAsyncThunk<
  SuccessMessageResponse,
  ChangePasswordPayload,
  { rejectValue: string }
>('profile/changePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await profileService.changePassword(data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});
