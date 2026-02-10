'use client';

import { useState, useRef, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import { AlertCircle } from 'lucide-react';
import {
  uploadProfilePicture,
  updateProfile,
  changePassword,
} from '@/features/profile/profileThunks';
import { showSuccess, showError, showLoading, closeLoading } from '@/common/utils/swal.utils';

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfileContent() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const isGoogleUser = user?.authProvider === 'GOOGLE';

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [initialValues, setInitialValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasEmail = !!user?.email;
  const hasPhone = !!user?.phone;

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileChanged = useMemo(() => {
    return (
      form.name !== initialValues.name ||
      form.email !== initialValues.email ||
      form.phone !== initialValues.phone
    );
  }, [form.name, form.email, form.phone, initialValues]);

  const passwordFieldsFilled = useMemo(() => {
    return !!(form.currentPassword || form.newPassword || form.confirmPassword);
  }, [form.currentPassword, form.newPassword, form.confirmPassword]);

  const canSave = profileChanged || (passwordFieldsFilled && !errors.newPassword && !errors.confirmPassword && !errors.currentPassword);

  const handleChange = (field: keyof typeof form, value: string) => {
    const newValue = field === 'phone' ? value.replace(/\s/g, '') : value;
    
    setForm((prev) => ({ ...prev, [field]: newValue }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === 'newPassword') {
      if (value.length > 0) {
        if (value.length < 8) {
          setErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 8 characters' }));
        } else if (!/(?=.*[a-z])/.test(value)) {
          setErrors((prev) => ({ ...prev, newPassword: 'Must contain a lowercase letter' }));
        } else if (!/(?=.*[A-Z])/.test(value)) {
          setErrors((prev) => ({ ...prev, newPassword: 'Must contain an uppercase letter' }));
        } else if (!/(?=.*\d)/.test(value)) {
          setErrors((prev) => ({ ...prev, newPassword: 'Must contain a number' }));
        } else if (!/(?=.*[@$!%*?&])/.test(value)) {
          setErrors((prev) => ({ ...prev, newPassword: 'Must contain a special character (@$!%*?&)' }));
        } else {
          setErrors((prev) => ({ ...prev, newPassword: undefined }));
        }
      } else {
        setErrors((prev) => ({ ...prev, newPassword: undefined }));
      }
    }

    if (field === 'confirmPassword') {
      if (value.length > 0 && value !== form.newPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (form.name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters';
    }

    if (form.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (form.phone.trim().length > 0) {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!phoneRegex.test(form.phone)) {
        newErrors.phone = 'Invalid phone format';
      }
    }

    if (passwordFieldsFilled && !isGoogleUser) {
      if (!form.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      const password = form.newPassword;
      if (password.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])/.test(password)) {
        newErrors.newPassword = 'Must contain a lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(password)) {
        newErrors.newPassword = 'Must contain an uppercase letter';
      } else if (!/(?=.*\d)/.test(password)) {
        newErrors.newPassword = 'Must contain a number';
      } else if (!/(?=.*[@$!%*?&])/.test(password)) {
        newErrors.newPassword = 'Must contain a special character (@$!%*?&)';
      }

      if (form.newPassword !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please select an image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showError('Too Large', 'Image must be under 2MB');
      return;
    }


    setUploading(true);
    const result = await dispatch(uploadProfilePicture(file));

    setUploading(false);

    if (uploadProfilePicture.fulfilled.match(result)) {
      showSuccess('Success!', 'Profile picture updated');
    } else {
      showError('Failed', (result.payload as string) || 'Upload failed');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let profileUpdated = false;
    let passwordChanged = false;

    if (profileChanged) {
      showLoading('Updating profile...');

      const profilePayload: { name: string; email?: string; phone?: string } = {
        name: form.name,
        ...(form.phone.trim() ? { phone: form.phone } : {}),
      };

      if (!isGoogleUser) {
        profilePayload.email = form.email;
      }

      const profileResult = await dispatch(updateProfile(profilePayload));

      closeLoading();

      if (updateProfile.fulfilled.match(profileResult)) {
        profileUpdated = true;
        const updatedUser = profileResult.payload.user;
        if (updatedUser) {
          setInitialValues({
            name: updatedUser.name,
            email: updatedUser.email || '',
            phone: updatedUser.phone || '',
          });
        }
      } else {
        const errorMsg = profileResult.payload as string;
        const error = errorMsg.toLowerCase();
        
        if (error.includes('email')) {
          setErrors((prev) => ({ ...prev, email: errorMsg }));
        } else if (error.includes('phone')) {
          setErrors((prev) => ({ ...prev, phone: errorMsg }));
        } else if (error.includes('name')) {
          setErrors((prev) => ({ ...prev, name: errorMsg }));
        } else {
          showError('Update Failed', errorMsg);
        }
        return;
      }
    }

    if (passwordFieldsFilled && !isGoogleUser) {
      showLoading('Changing password...');

      const passwordResult = await dispatch(
        changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      );

      closeLoading();

      if (changePassword.fulfilled.match(passwordResult)) {
        passwordChanged = true;
        setForm((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        const errorMsg = passwordResult.payload as string;
        const error = errorMsg.toLowerCase();
        
        if (error.includes('same as current')) {
          setErrors((prev) => ({ ...prev, newPassword: errorMsg }));
        } else if (error.includes('current password')) {
          setErrors((prev) => ({ ...prev, currentPassword: errorMsg }));
        } else if (error.includes('match')) {
          setErrors((prev) => ({ ...prev, confirmPassword: errorMsg }));
        } else if (error.includes('password must') || error.includes('8 characters')) {
          setErrors((prev) => ({ ...prev, newPassword: errorMsg }));
        } else {
          showError('Password Error', errorMsg);
        }
        return;
      }
    }

      if (profileUpdated && passwordChanged) {
        await showSuccess('Success!', 'Profile and password updated successfully');
      } else if (profileUpdated) {
        await showSuccess('Success!', 'Profile updated successfully');
      } else if (passwordChanged) {
        await showSuccess('Success!', 'Password changed successfully');
      }
  };

  const handleReset = () => {
    setForm({
      name: initialValues.name,
      email: initialValues.email,
      phone: initialValues.phone,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSave} className="max-w-6xl p-6 mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight font-heading">Profile Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <Card className="transition-shadow shadow-sm border-border/50 hover:shadow-md">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar className="w-40 h-40 ring-4 ring-primary/20">
              <AvatarImage src={user?.profilePicture || undefined} />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <Icon icon="eos-icons:loading" className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>

          <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB</p>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="transition-shadow shadow-sm border-border/50 hover:shadow-md">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Update your personal details and contact information
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={!hasEmail ? 'Add your email' : undefined}
                className={`${errors.email ? 'border-red-500' : ''} ${isGoogleUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                disabled={isGoogleUser}
                readOnly={isGoogleUser}
              />
              {isGoogleUser && (
                <p className="flex items-center gap-1 text-xs text-blue-600">
                  <Icon icon="logos:google-icon" className="w-3 h-3" />
                  Email is managed by your Google account
                </p>
              )}
              {!isGoogleUser && errors.email && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
              {!isGoogleUser && !hasEmail && !errors.email && (
                <p className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  Add email for better account recovery
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={!hasPhone ? 'Add your phone number' : undefined}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
            {!form.phone && !errors.phone && (
              <p className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="w-3 h-3" />
                Add phone for faster booking and notifications
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="transition-shadow shadow-sm border-border/50 hover:shadow-md">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {isGoogleUser
              ? 'Password change is not available for Google accounts'
              : 'Update your password to keep your account secure'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isGoogleUser ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 text-blue-700">
              <Icon icon="logos:google-icon" className="w-6 h-6" />
              <p className="text-sm">
                You signed in with Google. Password management is handled through your Google
                account.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    className={`pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Icon
                      icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      className="size-5"
                    />
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.newPassword}
                      onChange={(e) => handleChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                      className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon
                        icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        className="size-5"
                      />
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.newPassword}
                    </p>
                  )}
                  
                  {/* Password requirements list */}
                  {form.newPassword && !errors.newPassword && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p className={form.newPassword.length >= 8 ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
                        <Icon icon={form.newPassword.length >= 8 ? "solar:check-circle-bold" : "solar:circle-outline"} className="w-3 h-3" />
                        8+ characters
                      </p>
                      <p className={/(?=.*[a-z])/.test(form.newPassword) ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
                        <Icon icon={/(?=.*[a-z])/.test(form.newPassword) ? "solar:check-circle-bold" : "solar:circle-outline"} className="w-3 h-3" />
                        Lowercase letter
                      </p>
                      <p className={/(?=.*[A-Z])/.test(form.newPassword) ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
                         <Icon icon={/(?=.*[A-Z])/.test(form.newPassword) ? "solar:check-circle-bold" : "solar:circle-outline"} className="w-3 h-3" />
                        Uppercase letter
                      </p>
                      <p className={/(?=.*\d)/.test(form.newPassword) ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
                        <Icon icon={/(?=.*\d)/.test(form.newPassword) ? "solar:check-circle-bold" : "solar:circle-outline"} className="w-3 h-3" />
                        Number
                      </p>
                      <p className={/(?=.*[@$!%*?&])/.test(form.newPassword) ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
                        <Icon icon={/(?=.*[@$!%*?&])/.test(form.newPassword) ? "solar:check-circle-bold" : "solar:circle-outline"} className="w-3 h-3" />
                        Special char (@$!%*?&)
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                      className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon
                        icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        className="size-5"
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {!errors.confirmPassword &&
                    form.confirmPassword &&
                    form.newPassword === form.confirmPassword && (
                      <p className="flex items-center gap-1 text-xs text-green-600 mt-2">
                        <Icon icon="solar:check-circle-bold" className="w-3 h-3" />
                        Passwords match
                      </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={handleReset}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSave}
          className="shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
        >
          <Icon icon="solar:diskette-bold" className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
