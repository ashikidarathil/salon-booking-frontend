export interface ProfileState {
  updatingProfile: boolean;
  changingPassword: boolean;
  profileError: string | null;
  passwordError: string | null;
  profileUpdateSuccess: boolean;
  passwordChangeSuccess: boolean;
}
