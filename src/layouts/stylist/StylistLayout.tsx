'use client';

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authThunks';
import { fetchTotalUnreadCount } from '@/features/chat/chat.thunks';
import { NotificationCenter } from '@/features/notification/components/NotificationCenter';
import type { RootState } from '@/app/store';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

function StylistSidebarContent({
  onLogout,
  onNavigate,
}: {
  onLogout: () => void;
  onNavigate: (path: string) => void;
}) {
  const navItems: NavItem[] = [
    { icon: 'solar:widget-bold', label: 'Dashboard', path: '/stylist' },
    { icon: 'solar:calendar-bold', label: 'Appointments', path: '/stylist/appointments' },
    { icon: 'solar:clock-circle-bold', label: 'My Schedule', path: '/stylist/schedule' },
    { icon: 'solar:calendar-mark-bold', label: 'My Slots', path: '/stylist/slots' },
    { icon: 'solar:letter-bold', label: 'Leave Requests', path: '/stylist/off-days' },
    { icon: 'solar:bell-bold', label: 'Notifications', path: '/stylist/notifications' },
    { icon: 'solar:wallet-bold', label: 'My Wallet', path: '/stylist/wallet' },
    { icon: 'solar:star-bold', label: 'Reviews', path: '/stylist/reviews' },
    { icon: 'solar:user-bold', label: 'Profile', path: '/stylist/profile' },
  ];

  return (
    <>
      <SidebarHeader className="border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex items-center justify-center rounded-lg size-8 bg-primary">
            <Icon icon="solar:scissors-bold" className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Stylist Portal</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => onNavigate(item.path)}
                className="hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <Icon icon={item.icon} className="size-4" />
                  <span>{item.label}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem className="mt-4 pt-4 border-t border-border/50">
            <SidebarMenuButton
              onClick={onLogout}
              className="text-destructive hover:bg-destructive/10"
            >
              <Icon icon="solar:logout-bold" className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

export function StylistLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname === '/stylist/chat';
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { totalUnreadCount } = useAppSelector((state: RootState) => state.chat);

  useEffect(() => {
    if (user) {
      dispatch(fetchTotalUnreadCount());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/stylist/login', { replace: true });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <SidebarProvider className="theme-stylist">
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar (visible from md up) */}
        <Sidebar className="border-r border-border/50">
          <StylistSidebarContent
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-2 md:gap-4">
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost" className="md:hidden">
                    <Icon icon="solar:menu-dots-bold" className="size-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 theme-stylist">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Stylist Navigation</SheetTitle>
                    <SheetDescription>Stylist portal navigation and menu</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col h-full bg-[var(--color-sidebar)]">
                    <StylistSidebarContent
                      onLogout={handleLogout}
                      onNavigate={handleNavigate}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sidebar Trigger for Desktop/Tablet */}
              <div className="hidden md:block">
                <SidebarTrigger />
              </div>
              <div className="hidden sm:block w-px h-6 bg-border/50" />
              <h1 className="text-lg font-semibold hidden sm:block">Stylist Panel</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Chat icon button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => navigate('/stylist/chat')}
                title="Messages"
              >
                <Icon icon="solar:chat-round-bold-duotone" className="size-6" />
                {totalUnreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold border-2 border-background"
                  >
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </Badge>
                )}
              </Button>
              <NotificationCenter />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {user?.role.toLowerCase()}
                </p>
              </div>
              <Avatar className="size-9 ring-2 ring-primary/10 transition-shadow hover:ring-primary/30">
                <AvatarImage src={user?.profilePicture ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary uppercase">
                  {user?.name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main
            className={`flex-1 overflow-hidden bg-muted/30 ${
              isChatPage ? 'p-0' : 'p-4 md:p-6 lg:p-8 overflow-x-hidden'
            }`}
          >
            {isChatPage ? (
              <Outlet />
            ) : (
              <div className="mx-auto max-w-7xl">
                <Outlet />
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
