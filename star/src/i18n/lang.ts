import { useSyncExternalStore } from 'react';

/**
 * The page language, shared by the language switch and every page that shows
 * text. It used to live inside AuthShell's own state, so switching language
 * flipped the page to RTL while the form underneath stayed in English.
 */
export type Lang = 'ar' | 'en';

const STORAGE_KEY = 'nagm_lang';

const readSaved = (): Lang => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
};

let current: Lang = typeof window === 'undefined' ? 'ar' : readSaved();
const listeners = new Set<() => void>();

/** Stamp lang/dir on <html> so the browser, screen readers and CSS agree. */
export function applyLangToDocument(lang: Lang): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('lang', lang);
  root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  root.classList.toggle('rtl', lang === 'ar');
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
