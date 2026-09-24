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

type Lang = 'en' | 'ar';

const MSG = {
  en: {
    emailRequired: 'Email is required',
    emailTooLong: 'Email address is too long',
    emailSpaces: 'Email cannot contain spaces',
    emailOneAt: 'Email must contain a single @',
    emailLocal: 'Add the part before the @',
    emailDomain: 'Add the part after the @',
    emailDots: 'Email cannot contain two dots in a row',
    emailEdgeDot: 'Email cannot start or end with a dot',
    emailTld: 'Add a domain ending, like .com',
    emailInvalid: 'Enter a valid email address',
    phoneRequired: 'Phone number is required',
    phoneLetters: 'Phone number cannot contain letters',
    phoneInvalid: 'Enter a valid phone number',
    phoneIntl: 'Enter a valid international number',
    phoneCountryIntl: (country: string, example: string) => `Enter a valid ${country} number, e.g. ${example}`,
    phoneCountryLocal: (country: string, example: string) => `Enter a valid ${country} mobile number, e.g. ${example}`,
  },
  ar: {
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailTooLong: 'البريد الإلكتروني طويل جداً',
    emailSpaces: 'لا يمكن أن يحتوي البريد الإلكتروني على مسافات',
    emailOneAt: 'يجب أن يحتوي البريد الإلكتروني على علامة @ واحدة',
    emailLocal: 'أضف الجزء الذي يسبق @',
    emailDomain: 'أضف الجزء الذي يلي @',
    emailDots: 'لا يمكن أن يحتوي البريد الإلكتروني على نقطتين متتاليتين',
    emailEdgeDot: 'لا يمكن أن يبدأ اسم البريد أو ينتهي بنقطة',
    emailTld: 'أضف نهاية النطاق، مثل ‎.com',
    emailInvalid: 'أدخل بريداً إلكترونياً صحيحاً',
    phoneRequired: 'رقم الهاتف مطلوب',
    phoneLetters: 'لا يمكن أن يحتوي رقم الهاتف على حروف',
    phoneInvalid: 'أدخل رقم هاتف صحيحاً',
    phoneIntl: 'أدخل رقماً دولياً صحيحاً',
    phoneCountryIntl: (country: string, example: string) => `أدخل رقماً صحيحاً في ${country}، مثل ${example}`,
    phoneCountryLocal: (country: string, example: string) => `أدخل رقم جوال صحيحاً في ${country}، مثل ${example}`,
  },
};

/** Country names as shown in the UI; the English name stays the stored value. */
export const COUNTRY_NAMES_AR: Record<string, string> = {
  Egypt: 'مصر',
  'Saudi Arabia': 'السعودية',
  'United Arab Emirates': 'الإمارات',
};
const countryLabel = (country: string, lang: Lang) => (lang === 'ar' ? COUNTRY_NAMES_AR[country] || country : country);

/**
 * Returns an error message, or '' when the address is usable.
 * `required` lets a form treat an empty value as optional.
 */
export function emailError(value: string, required = true, lang: Lang = 'en'): string {
  const m = MSG[lang];
  const email = normalizeEmail(value);
  if (!email) return required ? m.emailRequired : '';
  if (email.length > 254) return m.emailTooLong;
  if (/\s/.test(email)) return m.emailSpaces;
  const parts = email.split('@');
  if (parts.length !== 2) return m.emailOneAt;
  const [local, domain] = parts;
  if (!local) return m.emailLocal;
  if (!domain) return m.emailDomain;
  if (email.includes('..')) return m.emailDots;
  if (local.startsWith('.') || local.endsWith('.')) return m.emailEdgeDot;
  if (!domain.includes('.')) return m.emailTld;
  if (!EMAIL_RE.test(email)) return m.emailInvalid;
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
export function phoneError(value: string, country?: string, required = true, lang: Lang = 'en'): string {
  const m = MSG[lang];
  const raw = (value || '').trim();
  if (!raw) return required ? m.phoneRequired : '';
  if (/[A-Za-z]/.test(raw)) return m.phoneLetters;
  const { digits, hadPlus } = cleanPhone(raw);
  if (!digits) return m.phoneInvalid;

  const rule = country ? PHONE_RULES[country] : undefined;
  if (hadPlus) {
    if (rule) {
      return rule.intl.test(digits) ? '' : m.phoneCountryIntl(countryLabel(country!, lang), `+${rule.code} ${rule.example.replace(/^0/, '')}`);
    }
    return /^\d{8,15}$/.test(digits) && !digits.startsWith('0') ? '' : m.phoneIntl;
  }
  if (rule) {
    if (rule.local.test(digits) || rule.intl.test(digits)) return '';
    return m.phoneCountryLocal(countryLabel(country!, lang), rule.example);
  }
  return /^\d{7,15}$/.test(digits) ? '' : m.phoneInvalid;
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
