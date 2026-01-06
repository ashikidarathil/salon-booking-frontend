import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { profileService } from '@/services/profile.service';
import type { UpdateProfilePayload, ChangePasswordPayload } from '@/services/profile.service';

export const uploadProfilePicture = createAsyncThunk<
  { profilePicture: string },
  File,
  { rejectValue: string }
>('profile/uploadProfilePicture', async (file, { rejectWithValue }) => {
  try {
    const res = await profileService.uploadProfilePicture(file);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to upload picture');
    }
    return rejectWithValue('Failed to upload picture');
  }
});

export const updateProfilePicture = createAsyncThunk<
  { profilePicture: string },
  File,
  { rejectValue: string }
>('profile/updateProfilePicture', async (file, { rejectWithValue }) => {
  try {
    const res = await profileService.updateProfilePicture(file);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to update picture');
    }
    return rejectWithValue('Failed to update picture');
  }
});

export const updateProfile = createAsyncThunk<
  { message: string },
  UpdateProfilePayload,
  { rejectValue: string }
>('profile/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await profileService.updateProfile(data);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to update profile');
    }
    return rejectWithValue('Failed to update profile');
  }
});

export const changePassword = createAsyncThunk<
  { message: string },
  ChangePasswordPayload,
  { rejectValue: string }
>('profile/changePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await profileService.changePassword(data);
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to change password');
    }
    return rejectWithValue('Failed to change password');
  }
});
