import { defineConfig, devices } from '@playwright/test';

/**
 * Real-browser tests for nagm.io - the landing, where sign-in actually lives.
 *
 * The app's /login is only a redirect to here, so the bugs in the sign-in
 * hand-off (Back returning to a frozen sign-in form) live in THIS repo, and
 * jsdom cannot reproduce history or the back-forward cache.
 *
 * The API and the app are both stand-ins: VITE_BACKEND_API and VITE_APP_ORIGIN
 * point at localhost addresses the tests intercept, so nothing reaches
 * production and no real account is used.
 */
const PORT = 5188;

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_BACKEND_API: 'http://localhost:5189/api',
      VITE_APP_ORIGIN: 'http://localhost:5190',
    },
  },
});
