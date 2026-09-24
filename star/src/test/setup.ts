import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setLang } from '../i18n/lang';

// vitest.config.ts has always pointed here, but the file did not exist, so no
// test could run at all.

// A first visit is Arabic (the site is Arabic-first); tests start in English
// and switch explicitly when they are about Arabic.
beforeEach(() => setLang('en'));

afterEach(() => {
  cleanup();
  localStorage.clear();
});
