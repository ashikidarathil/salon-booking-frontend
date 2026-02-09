'use client';

import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import { AlertCircle } from 'lucide-react';
import { uploadProfilePicture } from '@/features/profile/profileThunks';
import { showSuccess, showError } from '@/common/utils/swal.utils';

export default function ProfileContent() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasEmail = !!user?.email;
  const hasPhone = !!user?.phone;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const result = await dispatch(uploadProfilePicture(file));

    setUploading(false);

    if (uploadProfilePicture.fulfilled.match(result)) {
      showSuccess('Success!', 'Profile picture updated');
    } else {
      showError('Failed', (result.payload as string) || 'Upload failed');
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Saving profile:', form);
    showSuccess('Saved!', 'Profile updated successfully');
  };

  const isPasswordValid = form.newPassword.length >= 8 && form.newPassword === form.confirmPassword;

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
              <AvatarImage src={previewImage || user?.profilePicture || undefined} />
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
              />
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
              />
              {!hasEmail && (
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
            />
            {!hasPhone && (
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
            Update your password to keep your account secure
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button type="reset" variant="outline">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={uploading || !isPasswordValid}
          className="shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
        >
          <Icon icon="solar:diskette-bold" className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
