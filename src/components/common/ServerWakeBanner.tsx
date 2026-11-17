import { useSyncExternalStore } from 'react';
import { slowRequests } from '@/services/api/slowRequests';

export function ServerWakeBanner() {
  const isSlow = useSyncExternalStore(slowRequests.subscribe, slowRequests.isSlow);

  if (!isSlow) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-md items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg"
    >
      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span>Waking up the server, this can take up to a minute the first time…</span>
    </div>
  );
}
