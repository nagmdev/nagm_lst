import { describe, expect, it } from 'vitest';
import { emailError } from './contact';
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
