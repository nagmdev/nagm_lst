import { useSyncExternalStore } from 'react';

/**
 * The page language, shared by the language switch and every page that shows
 * text. It used to live inside AuthShell's own state, so switching language
 * flipped the page to RTL while the form underneath stayed in English.
 */
export type Lang = 'ar' | 'en';

const STORAGE_KEY = 'nagm_lang';

export const readSaved = (): Lang => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
};

/**
 * The marketing pages have one address per language: Arabic at the root
 * (/pricing) and English under /en (/en/pricing), so search engines can index
 * and cross-link both. Sign-in and sign-up pages keep a single address and
 * follow the visitor's saved choice.
 */
export const PAGE_PATHS = ['/', '/job-seekers', '/companies', '/pricing', '/about', '/terms', '/privacy'] as const;
export type PagePath = (typeof PAGE_PATHS)[number];

/** Split a pathname into its language and the page it names, or null for any other path. */
export function pageFromPath(pathname: string): { lang: Lang; page: PagePath } | null {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const en = p === '/en' || p.startsWith('/en/');
  const rest = en ? p.slice(3) || '/' : p;
  return (PAGE_PATHS as readonly string[]).includes(rest) ? { lang: en ? 'en' : 'ar', page: rest as PagePath } : null;
}

/** The address of `page` in `lang`, keeping any ?query or #hash on the end. */
export function pagePath(to: string, lang: Lang): string {
  const m = /^([^?#]*)(.*)$/.exec(to)!;
  const page = pageFromPath(m[1]);
  if (!page) return to;
  const base = lang === 'en' ? (page.page === '/' ? '/en' : `/en${page.page}`) : page.page;
  return `${base}${m[2]}`;
}

const initialLang = (): Lang => {
  if (typeof window === 'undefined') return 'ar';
  return pageFromPath(window.location.pathname)?.lang ?? readSaved();
};

let current: Lang = initialLang();
const listeners = new Set<() => void>();

/** Stamp lang/dir on <html> so the browser, screen readers and CSS agree. */
export function applyLangToDocument(lang: Lang): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('lang', lang);
  root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  root.classList.toggle('rtl', lang === 'ar');
}

/** Pre-rendering: the language of the page being rendered, without touching storage. */
export function setRenderLang(lang: Lang): void {
  current = lang;
}

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
  applyLangToDocument(lang);
  listeners.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}
