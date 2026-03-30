'use client';

import { useState, useEffect } from 'react';
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
import { fetchTotalUnreadCount } from '@/features/chat/chat.thunks';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';

import type { User } from '@/features/auth/auth.types';
import { NotificationCenter } from '@/features/notification/components/NotificationCenter';
import type { RootState } from '@/app/store';

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
  unreadCount = 0,
}: {
  user: User;
  onLogout: () => void;
  onNavigate?: () => void;
  pathname: string;
  unreadCount?: number;
}) {
  const role = user?.role || 'USER';
  const isUser = role === 'USER';
  const isStylist = role === 'STYLIST';

  const menuItems: MenuItem[] = [
    { icon: 'solar:user-bold', label: 'Profile Settings', path: '.', active: true },
    ...(isUser
      ? [
          { icon: 'solar:calendar-bold', label: 'My Bookings', path: '/profile/bookings' },
          { icon: 'solar:chat-round-bold', label: 'Messages', path: '/profile/chat' },
          { icon: 'solar:heart-bold', label: 'Favorites', path: '/profile/favorites' },
          { icon: 'solar:bell-bold', label: 'Notifications', path: '/profile/notifications' },
          // { icon: 'solar:ticket-bold', label: 'Coupons', path: '/profile/coupons' },
          // { icon: 'solar:star-bold', label: 'Salon Points', path: 'points' },
          { icon: 'solar:wallet-bold', label: 'My Wallet', path: 'wallet' },
        ]
      : isStylist
        ? [
            { icon: 'solar:calendar-bold', label: 'My Schedule', path: 'schedule' },
            { icon: 'solar:briefcase-bold', label: 'Appointments', path: 'appointments' },
            { icon: 'solar:trending-up-bold', label: 'Earnings', path: 'earnings' },
            // { icon: 'solar:star-bold', label: 'Reviews', path: '/profile/reviews' },
          ]
        : []),
    // { icon: 'solar:settings-bold', label: 'Settings', path: '/profile/settings' },
    // { icon: 'solar:chat-round-dots-bold', label: 'Contact Support', path: '/profile/support' },
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
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon icon={item.icon} className="size-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.label === 'Messages' && unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
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
  const { totalUnreadCount } = useAppSelector((state: RootState) => state.chat);

  const themeClass =
    user?.role === 'STYLIST' ? 'theme-stylist' : user?.role === 'ADMIN' ? 'theme-admin' : '';

  useEffect(() => {
    if (user) {
      dispatch(fetchTotalUnreadCount());
    }
  }, [dispatch, user]);

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
              unreadCount={totalUnreadCount}
            />
          )}
        </Sidebar>

        <SidebarInset className="bg-background min-w-0 overflow-hidden">
          <header className="flex items-center justify-between h-16 gap-2 px-4 sm:px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <SidebarTrigger className="-ml-1" />
                </SheetTrigger>
                <SheetContent side="left" className={`p-0 w-72 ${themeClass}`}>
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Sidebar</SheetTitle>
                    <SheetDescription>User profile navigation and menu</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col h-full bg-[var(--color-sidebar)]">
                    {user && (
                      <ProfileSidebarContent
                        user={user}
                        onLogout={handleLogout}
                        onNavigate={() => setIsMobileOpen(false)}
                        pathname={location.pathname}
                        unreadCount={totalUnreadCount}
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
                      : location.pathname === '/profile/notifications'
                        ? 'Notifications'
                        : location.pathname === '/profile/wallet'
                          ? 'My Wallet'
                          : 'Profile Settings'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <NotificationCenter />
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
