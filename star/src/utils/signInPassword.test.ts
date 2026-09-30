import { describe, it, expect } from 'vitest';
import { signInPasswordIssue, SIGN_IN_PASSWORD_MAX } from './signInPassword';

/**
 * What the sign-in form may refuse before asking the server.
 *
 * The form ran the SIGN-UP password policy (8-128 characters, 3 of 4
 * character classes) on sign-in too. So anyone whose existing password fails
 * today's policy - set before it existed, or by an admin reset - could not sign
 * in at all: the form blocked the request before the server, which is the only
 * one that knows whether the password is right, was ever asked.
 *
 * The backend's own loginValidation says why it does not do this: "existing
 * passwords predate the 128-character cap, so sign-in only refuses what can't
 * be a password at all". This mirrors that rule exactly.
 */
const t = { passwordRequired: 'required', passwordTooLong: 'too long' } as const;

describe('signInPasswordIssue', () => {
  it('asks for a password when there is none', () => {
    expect(signInPasswordIssue('', t)).toBe('required');
  });

  it('lets through the passwords the sign-up policy would reject - the server decides', () => {
    for (const legacy of [
      'short7c',              // under 8 characters
      'lettersanddigits123',  // only 2 of the 4 classes
      'onlylowercase',        // 1 class
      'x'.repeat(200),        // over the 128 sign-up cap
    ]) {
      expect(signInPasswordIssue(legacy, t)).toBe('');
    }
  });

  it('refuses only what cannot be a password at all, like the backend does', () => {
    expect(signInPasswordIssue('x'.repeat(SIGN_IN_PASSWORD_MAX), t)).toBe('');
    expect(signInPasswordIssue('x'.repeat(SIGN_IN_PASSWORD_MAX + 1), t)).toBe('too long');
  });

  it('matches the backend limit exactly', () => {
    // backend/src/middlewares/validation.ts loginValidation: v.length <= 1024
    expect(SIGN_IN_PASSWORD_MAX).toBe(1024);
  });
});
