import { describe, expect, it } from 'vitest';
import { emailError, phoneError, normalizePhone } from './contact';
import { linkIssue } from './links';
import { localizeServerMessage } from '../i18n/authText';

describe('emailError — mirrors the API rule, message in the page language', () => {
  it.each([
    ['sara@example.com'], ['Sara.Adel@Example.COM'], ['  sara@example.com  '], ['a+tag@sub.example.co'],
  ])('accepts %p', (email) => expect(emailError(email)).toBe(''));

  it.each([
    ['', 'Email is required'],
    ['   ', 'Email is required'],
    ['a@b', 'Add a domain ending, like .com'],
    ['no-at.com', 'Email must contain a single @'],
    ['x@@example.com', 'Email must contain a single @'],
    ['a b@example.com', 'Email cannot contain spaces'],
    ['x..y@example.com', 'Email cannot contain two dots in a row'],
    ['.x@example.com', 'Email cannot start or end with a dot'],
    ['@example.com', 'Add the part before the @'],
    ['سارة@example.com', 'Enter a valid email address'],
    [`${'a'.repeat(250)}@x.com`, 'Email address is too long'],
  ])('rejects %p with %p', (email, message) => expect(emailError(email)).toBe(message));

  it('answers in Arabic on the Arabic page', () => {
    expect(emailError('', true, 'ar')).toBe('البريد الإلكتروني مطلوب');
    expect(emailError('a@b', true, 'ar')).toMatch(/نهاية النطاق/);
  });

  it('treats empty as fine when the field is optional', () => expect(emailError('', false)).toBe(''));
});

describe('phoneError — optional at sign-up, but a typed number must be real', () => {
  it('allows an empty optional phone', () => expect(phoneError('', 'Egypt', false)).toBe(''));

  it.each([['01012345678'], ['1012345678'], ['+201012345678']])('accepts the Egyptian number %p', (n) =>
    expect(phoneError(n, 'Egypt', false)).toBe(''));

  it.each([['123'], ['0100'], ['0201234567'], ['phone']])('rejects %p for Egypt', (n) =>
    expect(phoneError(n, 'Egypt', false)).not.toBe(''));

  it('uses the Saudi rule when Saudi Arabia is picked', () => {
    expect(phoneError('0512345678', 'Saudi Arabia', false)).toBe('');
    expect(phoneError('01012345678', 'Saudi Arabia', false)).toMatch(/Saudi Arabia/);
  });

  it('names the country in Arabic on the Arabic page', () =>
    expect(phoneError('123', 'Egypt', false, 'ar')).toMatch(/مصر/));

  it('normalises to E.164 for the API', () => {
    expect(normalizePhone('01012345678', 'Egypt')).toBe('+201012345678');
    expect(normalizePhone('0512345678', 'Saudi Arabia')).toBe('+966512345678');
  });
});

describe('linkIssue — the same rules as backend/src/utils/profileLinks.ts', () => {
  it.each([
    ['linkedin', ''], ['linkedin', 'https://linkedin.com/in/sara'], ['linkedin', 'linkedin.com/in/sara'],
    ['linkedin', 'https://eg.linkedin.com/in/sara'], ['website', 'acme.com'], ['website', 'https://acme.co/جوبز'],
  ] as const)('accepts a %s link %p', (kind, value) => expect(linkIssue(kind, value)).toBe(''));

  it.each([
    ['linkedin', 'javascript:alert(1)'],
    ['linkedin', 'https://evil.example.com/linkedin.com'],
    ['linkedin', 'javascript:alert(1)//linkedin.com'],
    ['website', 'javascript:alert(document.cookie)'],
    ['website', 'data:text/html,<script>alert(1)</script>'],
    ['website', 'localhost'],
    ['website', 'not a url'],
  ] as const)('rejects a %s link %p', (kind, value) => expect(linkIssue(kind, value)).toBe('invalid'));
});

describe('localizeServerMessage', () => {
  it('translates known API messages on the Arabic page', () => {
    expect(localizeServerMessage('Email already exists', 'ar')).toBe('يوجد حساب بهذا البريد الإلكتروني بالفعل.');
    expect(localizeServerMessage('Please wait 42s before requesting a new code', 'ar')).toBe('انتظر 42 ثانية قبل طلب رمز جديد.');
  });

  it('leaves English alone and passes unknown messages through', () => {
    expect(localizeServerMessage('Email already exists', 'en')).toBe('Email already exists');
    expect(localizeServerMessage('Some new server message', 'ar')).toBe('Some new server message');
  });
});
