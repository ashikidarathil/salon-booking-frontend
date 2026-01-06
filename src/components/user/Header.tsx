// src/components/user/Header.tsx
'use client';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/app/hooks';
import { useAppDispatch } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth/authThunks';
import { Link } from 'react-router-dom';

export function Header() {
  const reduxUser = useAppSelector((state) => state.auth.user);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get user from Redux (cookies are handled automatically by axios)
  const getAuthenticatedUser = () => {
    console.log('📱 Current user from Redux:', reduxUser);

    // Since cookies are httpOnly, we can't read them from document.cookie
    // Trust Redux state + axios will handle cookies automatically
    return reduxUser;
  };

  const user = getAuthenticatedUser();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Stylists', href: '/stylists' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const iconButtons = [
    { icon: 'solar:bell-bold', label: 'Notifications', href: '/notifications' },
    { icon: 'solar:heart-bold', label: 'Favorites', href: '/favorites' },
  ];

  return (
    <header className="border-b border-border bg-card">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Icon icon="solar:scissors-bold" className="size-6 text-primary" />
          <span className="text-xl font-bold font-heading">SalonBook</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="items-center hidden gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`${
                item.label === 'Home' ? 'font-medium text-foreground' : 'text-muted-foreground'
              } hover:text-primary transition-colors`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Icons + Profile */}
        <div className="items-center hidden gap-3 lg:flex">
          {/* Show only if logged in */}
          {isAuthenticated && user && (
            <>
              {iconButtons.map((btn) => (
                <Button key={btn.label} size="icon" variant="ghost" className="size-8" asChild>
                  <Link to={btn.href}>
                    <Icon icon={btn.icon} className="size-5" />
                    <span className="sr-only">{btn.label}</span>
                  </Link>
                </Button>
              ))}

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="size-8">
                    <Icon icon="solar:user-bold" className="size-5" />
                    <span className="sr-only">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/user/profile" className="cursor-pointer">
                      <Icon icon="solar:user-bold" className="mr-2 size-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Icon icon="solar:settings-bold" className="mr-2 size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      dispatch(logout());
                      navigate('/');
                    }}
                    className="text-red-600 cursor-pointer"
                  >
                    <Icon icon="solar:logout-bold" className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* If not logged in — show Login button */}
          {!isAuthenticated && (
            <>
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="border-rounded">
                <Link to="/signup">Signup</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button size="icon" variant="ghost" className="size-8">
              <Icon icon="solar:menu-dots-bold" className="size-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <nav className="flex flex-col gap-4 mb-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-lg font-medium ${
                    item.label === 'Home' ? 'text-foreground' : 'text-muted-foreground'
                  } hover:text-primary transition-colors`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Section */}
            <div className="pt-6 border-t">
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Icon icon="solar:user-bold" className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {iconButtons.map((btn) => (
                      <Button key={btn.label} variant="outline" asChild>
                        <Link to={btn.href} className="flex flex-col items-center gap-1">
                          <Icon icon={btn.icon} className="size-5" />
                          <span className="text-xs">{btn.label}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/profile">View Profile</Link>
                  </Button>
                  <Button variant="destructive" asChild className="w-full">
                    <Link to="/logout">Logout</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
