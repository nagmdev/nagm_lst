import { useSyncExternalStore } from 'react';

const never = () => () => {};

/**
 * A value only the browser knows (a saved setting, the time zone), read so
 * that a page rendered ahead of time hydrates cleanly: `serverValue` while
 * React takes over the pre-rendered HTML, then `read()` right after.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(never, read, () => serverValue);
}
