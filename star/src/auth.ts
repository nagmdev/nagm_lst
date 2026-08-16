import axios from 'axios';

// nagm.io hosts sign-in/up and talks to the production API, then hands the
// session off to the app on app.nagm.io.
const API_BASE = 'https://backend-yqpd.vercel.app/api';
export const APP_ORIGIN = 'https://app.nagm.io';

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

// A random value we drop as a cookie on the shared `.nagm.io` parent domain and
// bind the hand-off code to. app.nagm.io reads it back to prove the code was
// minted for THIS browser — so a lured `#code=` link (whose code is bound to the
// attacker's nonce) can't plant a session in a victim who never held that nonce.
function randomNonce(): string {
  const buf = new Uint8Array(24);
  window.crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

function setNonceCookie(nonce: string) {
  const isSecure = window.location.protocol === 'https:';
  const host = window.location.hostname;
  // Scope to the registrable domain so app.nagm.io can read it too.
  const domainAttr = host.endsWith('nagm.io') ? '; domain=nagm.io' : '';
  const secureAttr = isSecure ? '; Secure' : '';
  document.cookie = `h_nonce=${nonce}; path=/; max-age=120; SameSite=Lax${domainAttr}${secureAttr}`;
}

/** Exchange the freshly-signed-in session for a one-time hand-off code and
 *  redirect to app.nagm.io/#code=<code>. No real token ever rides in the URL. */
export async function handoffToApp(t: Tokens, rememberMe: boolean): Promise<void> {
  const nonce = randomNonce();
  setNonceCookie(nonce);
  const { data } = await api.post<{ code: string }>(
    '/auth/handoff/create',
    { rememberMe, nonce },
    { headers: { Authorization: `Bearer ${t.accessToken}` } },
  );
  window.location.href = `${APP_ORIGIN}/#code=${encodeURIComponent(data.code)}`;
}

/** The kind of account chosen at sign-up. NOTE: this is a *request*, not an
 *  authorization level — a recruiter/company account is created as a normal user
 *  and only becomes HR when an admin approves it. */
export type AccountRole = 'candidate' | 'recruiter' | 'company';

export interface CompanyOption {
  id: number;
  name: string;
  slug?: string | null;
  verified?: boolean;
  emailDomain?: string | null;
}

export interface RegisterPayload {
  /** Set when the recruiter asked to join an existing company (id) at sign-up. */
  joinCompanyId?: number;
  email: string;
  password: string;
  role?: AccountRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  // Recruiter
  jobTitle?: string;
  linkedInProfile?: string;
  // Company
  companyName?: string;
  industry?: string;
  companySize?: string;
  websiteUrl?: string;
}

export const authApi = {
  login: (email: string, password: string, rememberMe: boolean) =>
    api.post<Tokens>('/auth/login', { email, password, rememberMe }).then((r) => r.data),
  /** Company directory for the sign-up picker ("which company do you work for?"). */
  searchCompanies: (q: string, email?: string) =>
    api
      .get<{ companies: CompanyOption[]; suggestedByDomain: number[] }>('/workspace/companies', {
        params: { q, ...(email ? { email } : {}) },
      })
      .then((r) => r.data)
      .catch(() => ({ companies: [], suggestedByDomain: [] })),
  register: (payload: RegisterPayload) =>
    api
      .post<{ message: string; id: string; email: string; requestedRole?: 'recruiter' | 'company' | null }>(
        '/auth/register',
        payload,
      )
      .then((r) => r.data),
  verifyEmail: (email: string, otp: string) =>
    api.post<{ message: string }>('/auth/verify-email', { email, otp }).then((r) => r.data),
  resend: (email: string) => api.post('/auth/resend-verification', { email }).then((r) => r.data),
  requestPasswordReset: (email: string) =>
    api.post<{ message: string }>('/auth/request-password-reset', { email }).then((r) => r.data),
  verifyPasswordResetOtp: (email: string, otp: string) =>
    api.post<{ message: string }>('/auth/verify-password-reset-otp', { email, otp }).then((r) => r.data),
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password-with-otp', { email, otp, newPassword }).then((r) => r.data),
};

export function apiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { error?: string; message?: string } } };
    return e.response?.data?.error || e.response?.data?.message || fallback;
  }
  return fallback;
}
