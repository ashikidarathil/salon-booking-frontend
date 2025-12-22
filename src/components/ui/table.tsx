import { cn } from '@/lib/utils';
import type { UIProps } from '@/types/ui';
import * as React from 'react';

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full border-collapse">{children}</table>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b">{children}</thead>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b">{children}</tr>;
}

export function TableHead({ children, className }: UIProps) {
  return <th className={cn('p-3 text-left text-sm', className)}>{children}</th>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableCell({ children, className }: UIProps) {
  return <td className={cn('p-3', className)}>{children}</td>;
}
