/**
 * What the sign-in form may refuse before asking the server.
 *
 * The form used to run the SIGN-UP password policy (8-128 characters, 3 of 4
 * character classes) on sign-in as well. Anyone whose existing password fails
 * today's policy - set before it existed, or by an admin reset - could then not
 * sign in at all: the form stopped the request before the server, the only
 * party that knows whether the password is right, was ever asked.
 *
 * This mirrors the backend's loginValidation exactly: a password must be
 * present and at most 1024 characters. Its comment gives the reason: existing
 * passwords predate the 128-character cap, so sign-in only refuses what cannot
 * be a password at all. The full policy still applies where a password is being
 * CHOSEN - sign-up and reset - not where an existing one is being typed.
 */
export const SIGN_IN_PASSWORD_MAX = 1024;

export interface SignInPasswordText {
  passwordRequired: string;
  passwordTooLong: string;
}

export function signInPasswordIssue(pw: string, t: SignInPasswordText): string {
  if (!pw) return t.passwordRequired;
  if (pw.length > SIGN_IN_PASSWORD_MAX) return t.passwordTooLong;
  return '';
}
