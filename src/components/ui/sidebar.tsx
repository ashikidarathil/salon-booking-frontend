'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { UIProps } from '@/types/ui';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full min-h-screen">{children}</div>;
}

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

export function SidebarHeader({ children, className }: UIProps) {
  return <div className={cn('border-b p-4', className)}>{children}</div>;
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto">{children}</div>;
}

export function SidebarMenu({ children, className }: UIProps) {
  return <ul className={cn('flex flex-col gap-1 px-2', className)}>{children}</ul>;
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

export function SidebarMenuButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-white/10',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col flex-1">{children}</div>;
}

export function SidebarTrigger() {
  return <button className="text-sm font-medium hover:opacity-80">☰</button>;
}
