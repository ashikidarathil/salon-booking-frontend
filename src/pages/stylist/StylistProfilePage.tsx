'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
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

export default function StylistProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

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

  const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasEmail = !!user?.email;
  const hasPhone = !!user?.phone;

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync preview image with user profile picture from Redux
  useEffect(() => {
    if (user?.profilePicture) {
      setPreviewImage(user.profilePicture);
    }
  }, [user?.profilePicture]);

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
    // Strip spaces from phone numbers
    const newValue = field === 'phone' ? value.replace(/\s/g, '') : value;
    
    setForm((prev) => ({ ...prev, [field]: newValue }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Real-time password validation
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

    // Confirm password validation
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

    // Validate name
    if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (form.name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters';
    }

    // Validate email if provided
    if (form.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    // Validate phone if provided
    if (form.phone.trim().length > 0) {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!phoneRegex.test(form.phone)) {
        newErrors.phone = 'Invalid phone format';
      }
    }

    // Validate password fields if any are filled
    if (passwordFieldsFilled) {
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

    // Don't set preview from FileReader - let Redux update handle it after upload
    // This prevents flickering between local preview and server URL
    setUploading(true);
    const result = await dispatch(uploadProfilePicture(file));

    setUploading(false);

    if (uploadProfilePicture.fulfilled.match(result)) {
      // Redux state will update user.profilePicture, and useEffect will sync previewImage
      showSuccess('Success!', 'Profile picture updated');
    } else {
      showError('Failed', (result.payload as string) || 'Upload failed');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    let profileUpdated = false;
    let passwordChanged = false;

    // Update profile if changed
    if (profileChanged) {
      showLoading('Updating profile...');

      const profilePayload: { name: string; email?: string; phone: string } = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

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
        // Handle backend errors
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

    // Change password if fields filled
    if (passwordFieldsFilled) {
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
        // Clear password fields
        setForm((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        // Handle password errors
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
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Stylist Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your professional details and account settings
        </p>
      </div>

      <Card className="transition-shadow shadow-sm border-border/50 hover:shadow-md">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar className="w-40 h-40 ring-4 ring-primary/20">
              <AvatarImage src={previewImage || user?.profilePicture || undefined} />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() || 'S'}
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

          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <Icon icon="solar:camera-bold" className="w-4 h-4 mr-2" />
            Change Photo
          </Button>
        </CardContent>
      </Card>

      <form onSubmit={handleSave}>
        <Card className="transition-shadow shadow-sm border-border/50 hover:shadow-md">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
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
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
                {!hasEmail && !errors.email && (
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
                  Add phone for notifications
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="mt-6 transition-shadow shadow-sm border-border/50 hover:shadow-md">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                  className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  <Icon
                    icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    className="w-5 h-5"
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
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                    className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    <Icon
                      icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      className="w-5 h-5"
                    />
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    <Icon
                      icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      className="w-5 h-5"
                    />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave}>
            <Icon icon="solar:diskette-bold" className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
