import React from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import { Icon } from '@iconify/react';

interface LoadingGateProps {
  loading: boolean;
  error: string | null;
  data: unknown;
  children: React.ReactNode;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  resetError?: () => void;
  backPath?: string;
  role?: 'ADMIN' | 'STYLIST' | 'USER';
}

export function LoadingGate({
  loading,
  error,
  data,
  children,
  loadingMessage = 'Loading content...',
  emptyMessage = 'No data found',
  emptyIcon,
  resetError,
  backPath,
  role = 'USER',
}: LoadingGateProps) {
  // Config based on role
  const roleConfig = {
    ADMIN: {
      emptyIcon: 'solar:folder-error-bold-duotone',
      emptyColor: 'bg-primary/5 text-primary/40',
    },
    STYLIST: {
      emptyIcon: 'solar:clipboard-list-bold-duotone',
      emptyColor: 'bg-primary/5 text-primary/40',
    },
    USER: {
      emptyIcon: 'solar:box-minimalistic-bold',
      emptyColor: 'bg-muted/30 text-muted-foreground/50',
    },
  }[role];

  const finalEmptyIcon = emptyIcon || roleConfig.emptyIcon;

  // 1. Loading State (prioritize if data is missing)
  if (loading && (!data || (Array.isArray(data) && data.length === 0))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        <p className="font-medium text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  // 2. Error State (only if not loading or we want to show error even with stale data)
  if (error && !loading) {
    return <ErrorDisplay error={error} resetError={resetError} backPath={backPath} />;
  }

  // 3. Empty State
  const isEmpty = !data || (Array.isArray(data) && data.length === 0);
  if (isEmpty && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <div
          className={`flex items-center justify-center w-20 h-20 mb-6 rounded-full ${roleConfig.emptyColor}`}
        >
          <Icon icon={finalEmptyIcon} className="size-10" />
        </div>
        <h3 className="mb-2 text-xl font-bold">{emptyMessage}</h3>
        <p className="text-muted-foreground">Adjust your filters or check back later.</p>
      </div>
    );
  }

  // 4. Success State
  return <>{children}</>;
}
