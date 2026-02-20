'use client';

import { useEffect, useState } from 'react';
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { logout } from '@/features/auth/authThunks';
import {
  loadSelectedBranchFromStorage,
  clearBranchSelected,
  setBranchSelected,
} from '@/features/branch/branch.slice';
import { fetchPublicBranches } from '@/features/branch/branch.thunks';
import { APP_ROUTES } from '@/common/constants/app.routes';

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedBranch, branches } = useAppSelector((state) => state.branch);

  const [branchPopoverOpen, setBranchPopoverOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('selectedBranch');
    if (saved && !selectedBranch) {
      dispatch(loadSelectedBranchFromStorage());
    }
  }, [dispatch, selectedBranch]);

  useEffect(() => {
    if (branches.length === 0) {
      dispatch(fetchPublicBranches());
    }
  }, [dispatch, branches.length]);

  const handleSelectBranch = (branch: typeof selectedBranch) => {
    if (branch) {
      dispatch(setBranchSelected(branch));
      setBranchPopoverOpen(false);
    }
  };

  const handleClearBranch = () => {
    dispatch(clearBranchSelected());
    navigate('/branches');
    setBranchPopoverOpen(false);
  };

  const navItems = [
    { label: 'Home', href: APP_ROUTES.PUBLIC.HOME },
    { label: 'Services', href: '/services' },
    { label: 'Stylists', href: APP_ROUTES.USER.STYLISTS },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: APP_ROUTES.PUBLIC.CONTACT },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Icon icon="solar:scissors-bold" className="size-6 text-primary" />
          <span className="text-xl font-bold">SalonBook</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="items-center hidden gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-sm font-medium hover:text-primary ${
                location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Branch Selection Popover (Visible on all screens) */}
          <Popover open={branchPopoverOpen} onOpenChange={setBranchPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative group h-10 w-10">
                <Icon
                  icon="solar:map-point-bold-duotone"
                  className={`size-6 transition-colors ${
                    selectedBranch ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                />
                {selectedBranch && (
                  <span className="absolute top-2 right-2 flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-primary"></span>
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-primary"></span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-32px)] sm:w-80 p-0 z-[2000] bg-white"
              align="end"
            >
              <div className="p-4 border-b bg-muted/30">
                <h4 className="font-semibold text-sm mb-1">Select Branch</h4>
                {selectedBranch ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Icon icon="solar:map-point-bold" className="size-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Current:{' '}
                      <span className="font-medium text-foreground">{selectedBranch.name}</span>
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Choose a branch to view services</p>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2">
                {branches && branches.length > 0 ? (
                  branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleSelectBranch(branch)}
                      className={`w-full text-left px-3 py-2.5 rounded-md hover:bg-muted transition-colors flex items-center justify-between group ${
                        selectedBranch?.id === branch.id ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            selectedBranch?.id === branch.id ? 'bg-primary/20' : 'bg-muted'
                          }`}
                        >
                          <Icon
                            icon="solar:buildings-2-bold"
                            className={`size-4 ${
                              selectedBranch?.id === branch.id
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{branch.name}</p>
                          {branch.address && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {branch.address}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedBranch?.id === branch.id && (
                        <Icon icon="solar:check-circle-bold" className="size-5 text-primary" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <Icon
                      icon="solar:map-point-broken"
                      className="size-12 mx-auto mb-2 text-muted-foreground/50"
                    />
                    <p className="text-sm text-muted-foreground">No branches available</p>
                  </div>
                )}
              </div>

              {selectedBranch && (
                <div className="p-3 border-t bg-muted/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearBranch}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon icon="solar:close-circle-bold" className="size-4 mr-2" />
                    Clear Selection
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-10 w-10">
                    <Icon icon="solar:user-bold" className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[2000] bg-white">
                  <DropdownMenuLabel>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email || user.phone}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={APP_ROUTES.USER.PROFILE}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={() => {
                      dispatch(logout());
                      navigate('/');
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Signup</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="lg:hidden h-10 w-10">
                <Icon icon="solar:menu-dots-bold" className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link key={item.label} to={item.href} className="text-lg font-medium">
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile User Account Section */}
              {isAuthenticated && user && (
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <Avatar className="size-10">
                      <AvatarImage src={user.profilePicture ?? undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Icon icon="solar:user-bold" className="size-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email || user.phone}
                      </p>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-4">
                    <Link
                      to={APP_ROUTES.USER.PROFILE}
                      className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
                    >
                      <Icon icon="solar:user-scan-bold-duotone" className="size-5 text-primary" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logout());
                        navigate('/');
                      }}
                      className="flex items-center gap-3 text-lg font-medium text-red-600 w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <Icon icon="solar:logout-2-bold-duotone" className="size-5" />
                      Logout
                    </button>
                  </nav>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
