'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { UIProps } from '@/types/ui';
import { Slot } from '@radix-ui/react-slot';

/* ---------------- Provider ---------------- */

export function SidebarProvider({ children, className }: UIProps) {
  return <div className={cn('flex w-full min-h-screen', className)}>{children}</div>;
}

/* ---------------- Sidebar ---------------- */

export function Sidebar({ children, className }: UIProps) {
  return (
    <aside
      className={cn(
        'w-64 bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)]',
        className,
      )}
    >
      {children}
    </aside>
  );
}

/* ---------------- Header ---------------- */

export function SidebarHeader({ children, className }: UIProps) {
  return <div className={cn('border-b p-4', className)}>{children}</div>;
}

/* ---------------- Content (FIXED) ---------------- */

export function SidebarContent({ children, className }: UIProps) {
  return <div className={cn('flex-1 overflow-y-auto', className)}>{children}</div>;
}

/* ---------------- Menu ---------------- */

export function SidebarMenu({ children, className }: UIProps) {
  return <ul className={cn('flex flex-col gap-1 px-2', className)}>{children}</ul>;
}

export function SidebarMenuItem({ children, className }: UIProps) {
  return <li className={cn(className)}>{children}</li>;
}

/* ---------------- Menu Button (FIXED asChild) ---------------- */

type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export function SidebarMenuButton({
  children,
  className,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      {...props}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-white/10',
        className,
      )}
    >
      {children}
    </Comp>
  );
}

/* ---------------- Inset (FIXED) ---------------- */

export function SidebarInset({ children, className }: UIProps) {
  return <div className={cn('flex flex-col flex-1', className)}>{children}</div>;
}

/* ---------------- Trigger ---------------- */

export function SidebarTrigger() {
  return <button className="text-sm font-medium hover:opacity-80">☰</button>;
}
