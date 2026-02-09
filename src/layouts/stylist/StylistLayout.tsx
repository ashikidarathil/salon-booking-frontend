'use client';

import { Outlet, useNavigate } from 'react-router-dom';
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
import { Icon } from '@iconify/react';
import { useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authThunks';

export function StylistLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/stylist/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen theme-stylist">
      <SidebarProvider>
        <Sidebar className="border-r ">
          <SidebarHeader>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex items-center justify-center rounded-lg size-8 bg-primary">
                <Icon icon="solar:scissors-bold" className="size-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Stylist Portal</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="bg-accent text-accent-foreground"
                  onClick={() => navigate('/stylist')}
                >
                  <Icon icon="solar:widget-bold" className="size-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/stylist/appointments')}>
                  <Icon icon="solar:calendar-bold" className="size-4" />
                  <span>Appointments</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/stylist/availability')}>
                  <Icon icon="solar:clock-circle-bold" className="size-4" />
                  <span>Availability</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/stylist/chat')}>
                  <Icon icon="solar:chat-round-bold" className="size-4" />
                  <span>Chat</span>
                  {/* <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    3
                  </span> */}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/stylist/reviews')}>
                  <Icon icon="solar:star-bold" className="size-4" />
                  <span>Reviews</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/stylist/profile')}>
                  <Icon icon="solar:user-bold" className="size-4" />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Icon icon="solar:logout-bold" className="size-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex items-center justify-between h-16 px-6 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="w-px h-6 bg-border" />
            </div>
            <Avatar>
              <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" />
              <AvatarFallback>SW</AvatarFallback>
            </Avatar>
          </header>

          <main className="flex-1 p-6 overflow-auto bg-muted/40">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
