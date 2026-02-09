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
import { APP_ROUTES } from '@/common/constants/app.routes';

export function SalonAdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen theme-admin">
      <SidebarProvider>
        <Sidebar className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-4">
              <div className="flex items-center justify-center rounded-lg size-8 bg-primary">
                <Icon icon="solar:scissors-bold" className="size-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Salon Admin</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin')}>
                  <Icon icon="solar:widget-bold" className="size-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin/bookings')}>
                  <Icon icon="solar:calendar-bold" className="size-4" />
                  <span>Bookings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin/users')}>
                  <Icon icon="solar:users-group-rounded-bold" className="size-4" />
                  <span>Customers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin/stylists')}>
                  <Icon icon="solar:user-bold" className="size-4" />
                  <span>Stylists</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate(APP_ROUTES.ADMIN.CATEGORIES)}>
                  <Icon icon="solar:folder-bold" className="size-4" />
                  <span>Categories</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate(APP_ROUTES.ADMIN.SERVICES)}>
                  <Icon icon="solar:scissors-square-bold" className="size-4" />
                  <span>Services</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate(APP_ROUTES.ADMIN.BRANCHES)}>
                  <Icon icon="solar:buildings-bold" className="size-4" />
                  <span>Branches</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin/settings')}>
                  <Icon icon="solar:settings-bold" className="size-4" />
                  <span>Settings</span>
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
              <AvatarImage src="https://randomuser.me/api/portraits/women/34.jpg" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </header>

          <main className="flex-1 p-6 overflow-auto bg-muted/40">
            <Outlet /> {/* Child pages render here */}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
