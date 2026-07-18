import axios from 'axios';

// nagm.io hosts sign-in/up and talks to the production API, then hands the
// session off to the app on app.nagm.io.
const API_BASE = 'https://backend-yqpd.vercel.app/api';
const APP_ORIGIN = 'https://app.nagm.io';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  role?: string;
  requiresVerification?: boolean;
}

/** Redirect to the app with the tokens in the URL fragment (not sent to any
 *  server); app.nagm.io reads them into cookies and strips them from the URL. */
export function handoffToApp(t: Tokens, rememberMe: boolean) {
  const p = new URLSearchParams();
  p.set('at', t.accessToken);
  p.set('rt', t.refreshToken);
  if (t.role) p.set('role', t.role);
  p.set('rm', rememberMe ? '1' : '0');
  window.location.href = `${APP_ORIGIN}/#${p.toString()}`;
}

export const authApi = {
  login: (email: string, password: string, rememberMe: boolean) =>
    api.post<Tokens>('/auth/login', { email, password, rememberMe }).then((r) => r.data),
  register: (payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post<{ message: string; id: string; email: string }>('/auth/register', payload).then((r) => r.data),
  verifyEmail: (email: string, otp: string) =>
    api.post<{ message: string }>('/auth/verify-email', { email, otp }).then((r) => r.data),
  resend: (email: string) => api.post('/auth/resend-verification', { email }).then((r) => r.data),
};

export function apiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { error?: string; message?: string } } };
    return e.response?.data?.error || e.response?.data?.message || fallback;
  }
  return fallback;
}
