import { cn } from '@/lib/utils';
import type { UIProps } from '@/types/ui';

export function Card({ children, className }: UIProps) {
  return (
    <div className={cn('rounded-xl border bg-card text-card-foreground shadow', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: UIProps) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>;
}

export function CardTitle({ children, className }: UIProps) {
  return (
    <h3 className={cn('font-semibold leading-none tracking-tight text-xl', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: UIProps) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
}
