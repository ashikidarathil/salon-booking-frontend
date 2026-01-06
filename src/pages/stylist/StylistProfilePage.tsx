// frontend/src/pages/stylist/StylistProfilePage.tsx

'use client';

import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { uploadProfilePicture } from '@/features/profile/profileThunks';
import { showSuccess, showError } from '@/utils/swal';

export default function StylistProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: 'Hair Cutting, Coloring',
    experience: '5+ years',
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Invalid', 'Please select an image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showError('Too Large', 'Max 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
    reader.readAsDataURL(file);

    dispatch(uploadProfilePicture(file));
  };

  const handleSave = () => {
    console.log('Saving stylist profile:', form);
    showSuccess('Saved!', 'Profile updated');
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Stylist Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your professional details</p>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar className="w-40 h-40">
              <AvatarImage src={previewImage || undefined} />
              <AvatarFallback className="text-4xl text-white bg-blue-600">
                {user?.name?.[0] || 'S'}
              </AvatarFallback>
            </Avatar>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <Button onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} readOnly />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone || 'Not set'} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input value={form.specialization} readOnly />
              <div className="flex gap-2 mt-2">
                <Badge>Hair Cutting</Badge>
                <Badge>Coloring</Badge>
                <Badge>Styling</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experience</Label>
            <Input value={form.experience} readOnly />
          </div>
        </CardContent>
      </Card>

      {/* Earnings */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">₹45,000</p>
              <p className="text-muted-foreground">This Month</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">4.8 ★</p>
              <p className="text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold">127</p>
              <p className="text-muted-foreground">Appointments</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Icon icon="solar:diskette-bold" className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
