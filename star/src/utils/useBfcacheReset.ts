import { useEffect, useRef } from 'react';

/**
 * Run `reset` when this page comes back out of the back-forward cache.
 *
 * A bfcache restore hands back a frozen snapshot of the page: React does not
 * re-run - no state initialiser, no effect - so whatever was true at the
 * moment the person left is still true. For a sign-in form that is a disaster:
 * success sets `busy` and navigates away without resetting it (the page is
 * leaving, after all), so Back restores a form whose button is permanently
 * disabled.
 *
 * `pageshow` fires on every load; only `persisted === true` means "restored".
 * Resetting on an ordinary load would clobber state the page just set up.
 *
 * The latest `reset` is always the one called, so callers can pass an inline
 * function without it going stale.
 */
export function useBfcacheReset(reset: () => void): void {
  const latest = useRef(reset);
  latest.current = reset;

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) latest.current();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
}
