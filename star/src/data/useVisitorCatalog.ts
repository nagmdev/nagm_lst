import { useEffect, useMemo, useState } from 'react';
import { useClientValue } from '../utils/useClientValue';
import { staticCatalog, fetchCatalog, guessMarket, type Catalog, type Market } from './pricing';

/**
 * The prices this visitor may buy at. The API picks the market (where they
 * are, or the country their account signed up in); until it answers, the
 * list prices for the browser's best guess. A pre-rendered page shows INTL
 * first so it hydrates cleanly.
 */
export function useVisitorCatalog(): Catalog {
  const guessed = useClientValue<Market>(guessMarket, 'INTL');
  const [live, setLive] = useState<Catalog | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchCatalog(ctrl.signal).then((c) => { if (!ctrl.signal.aborted) setLive(c); }).catch(() => { /* list prices stay */ });
    return () => ctrl.abort();
  }, []);
  return useMemo(() => live ?? staticCatalog(guessed), [live, guessed]);
}
