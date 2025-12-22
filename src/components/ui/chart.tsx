import type { UIProps } from '@/types/ui';

export function ChartContainer({ children, className }: UIProps) {
  return <div className={className}>{children}</div>;
}
