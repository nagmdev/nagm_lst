import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBfcacheReset } from './useBfcacheReset';

/**
 * A page restored from the back-forward cache is a frozen snapshot.
 *
 * When sign-in succeeds the form sets `busy` and navigates away - it never
 * resets `busy`, because the page is leaving. The browser can then keep that
 * page in its back-forward cache exactly as it was: button disabled, spinner
 * spinning. Pressing Back hands the snapshot back, and React does NOT re-run -
 * no state initialiser, no effect - so the button stays dead and the person
 * cannot sign in without reloading.
 *
 * The only signal the browser gives is `pageshow` with `persisted === true`.
 */
const fire = (persisted: boolean) => {
  const e = new Event('pageshow') as PageTransitionEvent;
  Object.defineProperty(e, 'persisted', { value: persisted });
  window.dispatchEvent(e);
};

describe('useBfcacheReset', () => {
  it('resets when the page is restored from the back-forward cache', () => {
    const reset = vi.fn();
    renderHook(() => useBfcacheReset(reset));
    fire(true);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('leaves an ordinary first load alone', () => {
    // pageshow also fires on a normal load, with persisted === false. Resetting
    // then would clobber state the page just set up.
    const reset = vi.fn();
    renderHook(() => useBfcacheReset(reset));
    fire(false);
    expect(reset).not.toHaveBeenCalled();
  });

  it('stops listening once the page unmounts', () => {
    const reset = vi.fn();
    const { unmount } = renderHook(() => useBfcacheReset(reset));
    unmount();
    fire(true);
    expect(reset).not.toHaveBeenCalled();
  });

  it('always calls the latest reset, not the one captured at mount', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ fn }) => useBfcacheReset(fn), { initialProps: { fn: first } });
    rerender({ fn: second });
    fire(true);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
