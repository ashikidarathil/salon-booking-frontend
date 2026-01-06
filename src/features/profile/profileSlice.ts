// frontend/src/features/profile/profileSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import { updateProfile, changePassword } from './profileThunks';

interface ProfileState {
  updatingProfile: boolean;
  changingPassword: boolean;
  profileError: string | null;
  passwordError: string | null;
  profileUpdateSuccess: boolean;
  passwordChangeSuccess: boolean;
}

const initialState: ProfileState = {
  updatingProfile: false,
  changingPassword: false,
  profileError: null,
  passwordError: null,
  profileUpdateSuccess: false,
  passwordChangeSuccess: false,
};

const slice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.profileError = null;
    },
    clearPasswordError(state) {
      state.passwordError = null;
    },
    clearProfileSuccess(state) {
      state.profileUpdateSuccess = false;
    },
    clearPasswordSuccess(state) {
      state.passwordChangeSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile (name, email, phone)
      .addCase(updateProfile.pending, (state) => {
        state.updatingProfile = true;
        state.profileError = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updatingProfile = false;
        state.profileUpdateSuccess = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updatingProfile = false;
        state.profileError = action.payload || 'Failed to update profile';
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.changingPassword = true;
        state.passwordError = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changingPassword = false;
        state.passwordChangeSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changingPassword = false;
        state.passwordError = action.payload || 'Failed to change password';
      });
  },
});

export const { clearProfileError, clearPasswordError, clearProfileSuccess, clearPasswordSuccess } =
  slice.actions;

export default slice.reducer;
