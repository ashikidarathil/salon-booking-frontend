import { cn } from '@/lib/utils';
import type { UIProps } from '@/types/ui';

export function Card({ children, className }: UIProps) {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: UIProps) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: UIProps) {
  return <h3 className={cn('font-semibold leading-none tracking-tight', className)}>{children}</h3>;
}

export function CardContent({ children, className }: UIProps) {
  return <div className={cn('p-4 pt-0', className)}>{children}</div>;
}
