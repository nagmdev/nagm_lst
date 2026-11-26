import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setLang } from '../i18n/lang';
import { api } from '../auth';

// vitest.config.ts has always pointed here, but the file did not exist, so no
// test could run at all.

// No test talks to a real server (sheet #71). Rendering the landing or the
// pricing page fetches /billing/catalog, and jsdom's XMLHttpRequest really
// sends it — to the production API. Every request a test does not stub now
// fails as if offline (a path the pages already handle: list prices stay),
// and is recorded so a test can check what was attempted.
export const blockedRequests: string[] = [];
const offline = (what: string) => {
  blockedRequests.push(what);
  const err = Object.assign(new Error(`Network blocked in tests: ${what}`), { code: 'ERR_NETWORK' });
  return Promise.reject(err);
};
api.defaults.adapter = (config) => offline(`${(config.method || 'get').toUpperCase()} ${config.baseURL ?? ''}${config.url ?? ''}`);
globalThis.fetch = ((input: RequestInfo | URL) => offline(`fetch ${String(input instanceof Request ? input.url : input)}`)) as typeof fetch;
if (typeof XMLHttpRequest !== 'undefined') {
  XMLHttpRequest.prototype.send = function send(this: XMLHttpRequest) {
    blockedRequests.push('XMLHttpRequest');
    throw new Error('Network blocked in tests: XMLHttpRequest');
  };
}

// A first visit is Arabic (the site is Arabic-first); tests start in English
// and switch explicitly when they are about Arabic.
beforeEach(() => setLang('en'));

afterEach(() => {
  cleanup();
  localStorage.clear();
});
