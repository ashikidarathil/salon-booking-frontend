'use client';

import { Outlet, Link } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Icon } from '@iconify/react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAppSelector } from '@/app/hooks';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  active?: boolean;
}

export default function ProfileLayout() {
  const { user } = useAppSelector((state) => state.auth);

  const role = user?.role || 'USER';
  const isUser = role === 'USER';
  const isStylist = role === 'STYLIST';

  const menuItems: MenuItem[] = [
    { icon: 'solar:user-bold', label: 'Profile Settings', path: '.', active: true },
    ...(isUser
      ? [
          { icon: 'solar:calendar-bold', label: 'My Bookings', path: 'bookings' },
          { icon: 'solar:heart-bold', label: 'Favorites', path: 'favorites' },
          { icon: 'solar:ticket-bold', label: 'Coupons', path: 'coupons' },
          { icon: 'solar:star-bold', label: 'Salon Points', path: 'points' },
          { icon: 'solar:wallet-bold', label: 'My Wallet', path: 'wallet' },
        ]
      : isStylist
        ? [
            { icon: 'solar:calendar-bold', label: 'My Schedule', path: 'schedule' },
            { icon: 'solar:briefcase-bold', label: 'Appointments', path: 'appointments' },
            { icon: 'solar:trending-up-bold', label: 'Earnings', path: 'earnings' },
            { icon: 'solar:star-bold', label: 'Reviews', path: 'reviews' },
          ]
        : []),
    { icon: 'solar:settings-bold', label: 'Settings', path: 'settings' },
    { icon: 'solar:chat-round-dots-bold', label: 'Contact Support', path: 'support' },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/50">
        <Link to="/" className="block">
          <SidebarHeader className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={user?.profilePicture ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Icon icon="solar:user-bold" className="size-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sidebar-foreground">
                  {user?.name || 'My Profile'}
                </div>
              </div>
            </div>
          </SidebarHeader>
        </Link>

        <SidebarContent>
          <SidebarMenu className="p-2 space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                {/* ← FIXED: Use asChild + wrapper for className */}
                <SidebarMenuButton asChild>
                  <Link
                    to={item.path}
                    className={`w-full justify-start rounded-lg transition-colors ${
                      item.active
                        ? 'font-medium bg-primary/10 text-primary hover:bg-primary/20'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon icon={item.icon} className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="justify-start w-full text-left rounded-lg text-destructive hover:bg-destructive/10">
                  <Icon icon="solar:logout-2-bold" className="size-4" />
                  <span>Logout</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center h-16 gap-2 px-6 border-b border-border">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold">Profile Settings</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
