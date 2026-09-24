/**
 * Profile links (LinkedIn, website) — the same rules the API applies in
 * backend/src/utils/profileLinks.ts, so the form never accepts a link the
 * server will refuse, nor refuses one it would accept ("acme.com" is fine; the
 * server adds https://).
 */
export type LinkKind = 'linkedin' | 'website';

/** '' when the value is empty or a usable link; otherwise which rule failed. */
export function linkIssue(kind: LinkKind, raw: string): '' | 'invalid' {
  const value = (raw || '').trim();
  if (!value) return '';
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return 'invalid';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'invalid';
  if (!url.hostname || !url.hostname.includes('.')) return 'invalid';
  if (kind === 'linkedin' && !url.hostname.toLowerCase().includes('linkedin.com')) return 'invalid';
  return '';
}
