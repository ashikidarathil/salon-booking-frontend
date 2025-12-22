import * as React from 'react';
import { cn } from '@/lib/utils';
import type { UIProps } from '@/types/ui';

export function Avatar({ children, className }: UIProps) {
  return (
    <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}>
      {children}
    </div>
  );
}

export function AvatarImage({ src }: { src?: string }) {
  return <img src={src} alt="" className="object-cover w-full h-full" />;
}

export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center w-full h-full text-sm bg-muted">
      {children}
    </div>
  );
}
