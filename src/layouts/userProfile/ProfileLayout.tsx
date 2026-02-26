'use client';

import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authThunks';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import type { User } from '@/features/auth/auth.types';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  active?: boolean;
}

function ProfileSidebarContent({
  user,
  onLogout,
  onNavigate,
  pathname,
}: {
  user: User;
  onLogout: () => void;
  onNavigate?: () => void;
  pathname: string;
}) {
  const role = user?.role || 'USER';
  const isUser = role === 'USER';
  const isStylist = role === 'STYLIST';

  const menuItems: MenuItem[] = [
    { icon: 'solar:user-bold', label: 'Profile Settings', path: '.', active: true },
    ...(isUser
      ? [
          { icon: 'solar:calendar-bold', label: 'My Bookings', path: '/profile/bookings' },
          { icon: 'solar:heart-bold', label: 'Favorites', path: '/profile/favorites' },
          { icon: 'solar:ticket-bold', label: 'Coupons', path: '/profile/coupons' },
          { icon: 'solar:star-bold', label: 'Salon Points', path: 'points' },
          { icon: 'solar:wallet-bold', label: 'My Wallet', path: 'wallet' },
        ]
      : isStylist
        ? [
            { icon: 'solar:calendar-bold', label: 'My Schedule', path: 'schedule' },
            { icon: 'solar:briefcase-bold', label: 'Appointments', path: 'appointments' },
            { icon: 'solar:trending-up-bold', label: 'Earnings', path: 'earnings' },
            { icon: 'solar:star-bold', label: 'Reviews', path: '/profile/reviews' },
          ]
        : []),
    { icon: 'solar:settings-bold', label: 'Settings', path: '/profile/settings' },
    { icon: 'solar:chat-round-dots-bold', label: 'Contact Support', path: '/profile/support' },
  ];

  const checkActive = (path: string) => {
    if (path === '.') return pathname === '/profile' || pathname === '/profile/';
    return pathname.startsWith(path);
  };

  return (
    <>
      <Link to="/" className="block ">
        <SidebarHeader className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={user?.profilePicture ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Icon icon="solar:user-bold" className="size-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sidebar-foreground truncate max-w-[140px]">
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
              <SidebarMenuButton asChild>
                <Link
                  to={item.path}
                  onClick={() => onNavigate?.()}
                  className={`w-full justify-start rounded-lg transition-colors ${
                    checkActive(item.path)
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
              <button
                onClick={onLogout}
                className="justify-start w-full text-left rounded-lg text-destructive hover:bg-destructive/10"
              >
                <Icon icon="solar:logout-2-bold" className="size-4" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

export default function ProfileLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const themeClass =
    user?.role === 'STYLIST' ? 'theme-stylist' : user?.role === 'ADMIN' ? 'theme-admin' : '';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <SidebarProvider className={themeClass}>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border/50">
          {user && (
            <ProfileSidebarContent
              user={user}
              onLogout={handleLogout}
              pathname={location.pathname}
            />
          )}
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="flex items-center h-16 gap-2 px-4 sm:px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <SidebarTrigger className="-ml-1" />
              </SheetTrigger>
              <SheetContent side="left" className={`p-0 w-72 ${themeClass}`}>
                <div className="flex flex-col h-full bg-[var(--color-sidebar)]">
                  {user && (
                    <ProfileSidebarContent
                      user={user}
                      onLogout={handleLogout}
                      onNavigate={() => setIsMobileOpen(false)}
                      pathname={location.pathname}
                    />
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {/\/profile\/bookings\/.+/.test(location.pathname)
                ? 'Booking Details'
                : location.pathname === '/profile/bookings'
                  ? 'My Bookings'
                  : location.pathname === '/profile/favorites'
                    ? 'My Favorites'
                    : 'Profile Settings'}
            </h1>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
