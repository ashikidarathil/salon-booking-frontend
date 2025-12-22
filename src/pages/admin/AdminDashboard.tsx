// import { useAppDispatch } from '../../app/hooks';
// import { logout } from '../../features/auth/authThunks';
// import { useNavigate } from 'react-router-dom';

// export default function AdminDashboard() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     await dispatch(logout());
//     navigate('/login');
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
//         <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Admin Dashboard</h2>

//         <p className="mb-6 text-center text-grey-600">Welcome, Admin! You have full access.</p>

//         <button
//           onClick={handleLogout}
//           className="w-full px-4 py-2 font-medium text-white transition-colors duration-200 bg-red-600 rounded-md hover:bg-red-700"
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }

'use client';

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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { Icon } from '@iconify/react';
import { LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authThunks';
import { useNavigate } from 'react-router-dom';

export function SalonAdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout()); 
    navigate('/login', { replace: true }); 
  };
  return (
    <SidebarProvider>
      {/* SIDEBAR */}
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg size-8 bg-primary">
              <Icon icon="solar:scissors-bold" className="size-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Salon Admin</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <SidebarMenuButton className="bg-white text-primary">
                <Icon icon="solar:widget-bold" className="size-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton>
                <Icon icon="solar:calendar-bold" className="size-4" />
                <span>Bookings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton>
                <Icon icon="solar:user-bold" className="size-4" />
                <span>Users</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton>
                <Icon icon="solar:settings-bold" className="size-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <Icon icon="solar:logout-bold" className="size-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      {/* MAIN CONTENT */}
      <SidebarInset>
        {/* TOP BAR */}
        <header className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="w-px h-6 bg-border" />
            <h1 className="text-xl font-semibold font-heading">Dashboard</h1>
          </div>

          <Avatar>
            <AvatarImage src="https://randomuser.me/api/portraits/women/34.jpg" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 p-6 overflow-auto bg-background">
          <div className="mx-auto space-y-6 max-w-7xl">
            {/* STATS */}
            <div className="grid grid-cols-4 gap-6">
              <StatCard title="Total Customers" value="1,248" icon="solar:user-bold" />
              <StatCard title="Total Branches" value="8" icon="solar:home-bold" />
              <StatCard title="Total Bookings" value="2,345" icon="solar:calendar-bold" />
              <StatCard title="Revenue" value="$45,231" icon="solar:dollar-bold" />
            </div>

            {/* CHART */}
            <Card>
              <CardHeader>
                <CardTitle>Bookings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="w-full h-72">
                  <LineChart
                    data={[
                      { day: 'Mon', bookings: 12 },
                      { day: 'Tue', bookings: 18 },
                      { day: 'Wed', bookings: 15 },
                      { day: 'Thu', bookings: 22 },
                      { day: 'Fri', bookings: 28 },
                      { day: 'Sat', bookings: 32 },
                      { day: 'Sun', bookings: 25 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* TABLE */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell>Sarah Connor</TableCell>
                      <TableCell>Hair Styling</TableCell>
                      <TableCell>
                        <Badge className="text-green-700 bg-green-100">Confirmed</Badge>
                      </TableCell>
                      <TableCell className="text-right">$120</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Michael Jordan</TableCell>
                      <TableCell>Beard Trim</TableCell>
                      <TableCell>
                        <Badge className="text-yellow-700 bg-yellow-100">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">$35</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

/* -------------------- */
/* REUSABLE STAT CARD   */
/* -------------------- */

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon icon={icon} className="size-4 text-muted" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
