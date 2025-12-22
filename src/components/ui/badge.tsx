import { cn } from '@/lib/utils';
import type { UIProps } from '@/types/ui';

export function Badge({ children, className }: UIProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium', className)}
    >
      {children}
    </span>
  );
}
