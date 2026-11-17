// Tracks requests that take longer than SLOW_AFTER_MS so the UI can explain
// the delay (the free-tier backend sleeps when idle and needs ~30-50s to wake).
const SLOW_AFTER_MS = 4000;

let slowCount = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const slowRequests = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  isSlow: () => slowCount > 0,

  /** Call when a request starts; call the returned function when it settles. */
  track(): () => void {
    let markedSlow = false;
    const timer = setTimeout(() => {
      markedSlow = true;
      slowCount += 1;
      emit();
    }, SLOW_AFTER_MS);

    return () => {
      clearTimeout(timer);
      if (markedSlow) {
        slowCount -= 1;
        emit();
      }
    };
  },
};
