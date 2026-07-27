/**
 * Email and phone validation shared by every form that collects them.
 *
 * Mirrors the server rules in backend/src/utils/contact.ts — the server is the
 * real gate; this exists so people get a clear message before submitting.
 */

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

/** Misspellings of the big providers that we can confidently correct. */
const DOMAIN_TYPOS: Record<string, string> = {
  'gmail.co': 'gmail.com', 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com',
  'gmail.cm': 'gmail.com', 'gmaill.com': 'gmail.com', 'gnail.com': 'gmail.com',
  'gamil.com': 'gmail.com', 'gmil.com': 'gmail.com', 'gmail.con': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'hotmall.com': 'hotmail.com', 'homtail.com': 'hotmail.com',
  'yahoo.co': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com', 'yhaoo.com': 'yahoo.com',
  'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlook.co': 'outlook.com',
  'iclod.com': 'icloud.com', 'icloud.co': 'icloud.com',
};

export const normalizeEmail = (value: string): string => (value || '').trim();

/**
 * Returns an error message, or '' when the address is usable.
 * `required` lets a form treat an empty value as optional.
 */
export function emailError(value: string, required = true): string {
  const email = normalizeEmail(value);
  if (!email) return required ? 'Email is required' : '';
  if (email.length > 254) return 'Email address is too long';
  if (/\s/.test(email)) return 'Email cannot contain spaces';
  const parts = email.split('@');
  if (parts.length !== 2) return 'Email must contain a single @';
  const [local, domain] = parts;
  if (!local) return 'Add the part before the @';
  if (!domain) return 'Add the part after the @';
  if (email.includes('..')) return 'Email cannot contain two dots in a row';
  if (local.startsWith('.') || local.endsWith('.')) return 'Email cannot start or end with a dot';
  if (!domain.includes('.')) return 'Add a domain ending, like .com';
  if (!EMAIL_RE.test(email)) return 'Enter a valid email address';
  return '';
}

/** A likely-intended address when the domain looks misspelled, else null. */
export function emailSuggestion(value: string): string | null {
  const email = normalizeEmail(value).toLowerCase();
  const at = email.lastIndexOf('@');
  if (at < 0) return null;
  const domain = email.slice(at + 1);
  const fixed = DOMAIN_TYPOS[domain];
  return fixed ? `${email.slice(0, at)}@${fixed}` : null;
}

const PHONE_RULES: Record<string, { code: string; local: RegExp; intl: RegExp; example: string }> = {
  Egypt: { code: '20', local: /^0?1[0125]\d{8}$/, intl: /^201[0125]\d{8}$/, example: '01012345678' },
  'Saudi Arabia': { code: '966', local: /^0?5\d{8}$/, intl: /^9665\d{8}$/, example: '0512345678' },
  'United Arab Emirates': { code: '971', local: /^0?5\d{8}$/, intl: /^9715\d{8}$/, example: '0501234567' },
};

const cleanPhone = (value: string) => {
  const trimmed = (value || '').trim();
  const hadPlus = trimmed.startsWith('+') || trimmed.startsWith('00');
  return { digits: trimmed.replace(/^00/, '').replace(/\D/g, ''), hadPlus };
};

/** Returns an error message, or '' when the number is usable. */
export function phoneError(value: string, country?: string, required = true): string {
  const raw = (value || '').trim();
  if (!raw) return required ? 'Phone number is required' : '';
  if (/[A-Za-z]/.test(raw)) return 'Phone number cannot contain letters';
  const { digits, hadPlus } = cleanPhone(raw);
  if (!digits) return 'Enter a valid phone number';

  const rule = country ? PHONE_RULES[country] : undefined;
  if (hadPlus) {
    if (rule) {
      return rule.intl.test(digits) ? '' : `Enter a valid ${country} number, e.g. +${rule.code} ${rule.example.replace(/^0/, '')}`;
    }
    return /^\d{8,15}$/.test(digits) && !digits.startsWith('0') ? '' : 'Enter a valid international number';
  }
  if (rule) {
    if (rule.local.test(digits) || rule.intl.test(digits)) return '';
    return `Enter a valid ${country} mobile number, e.g. ${rule.example}`;
  }
  return /^\d{7,15}$/.test(digits) ? '' : 'Enter a valid phone number';
}

/** Convert an accepted number to E.164 for storage/sending. */
export function normalizePhone(value: string, country?: string): string {
  const { digits, hadPlus } = cleanPhone(value);
  if (!digits) return '';
  const rule = country ? PHONE_RULES[country] : undefined;
  if (hadPlus) return `+${digits}`;
  if (rule) {
    if (rule.intl.test(digits)) return `+${digits}`;
    return `+${rule.code}${digits.replace(/^0/, '')}`;
  }
  return digits;
}

/** Placeholder for a country's phone field. */
export const phoneExample = (country?: string): string =>
  (country && PHONE_RULES[country]?.example) || '01012345678';
