// Marker stored in the (required) `password` column for accounts that were
// created through Google Sign-In. Because it is not a valid bcrypt hash,
// `bcrypt.compare` always resolves `false`, so a Google-only account can never
// be authenticated through the password login endpoint. Google accounts are
// identified by the stable `users.google_id` column; this marker only satisfies
// the legacy NOT NULL constraint on `password`.
export const GOOGLE_OAUTH_PASSWORD_MARKER = 'GOOGLE_OAUTH_NO_PASSWORD';

// Short-lived, httpOnly cookies used to bind the OAuth callback to the browser
// that started the flow (CSRF protection / state validation) and to remember
// where to send the user back to.
export const OAUTH_STATE_COOKIE = 'oauth_state';
export const OAUTH_REDIRECT_COOKIE = 'oauth_redirect';
export const OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

export const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:3000';

// Frontend route the browser is sent to once the flow finishes. The route reads
// the non-sensitive `google` query flag and refetches the session from
// /api/auth/me using the httpOnly cookies.
export const GOOGLE_AUTH_FRONTEND_PATH = '/auth/login';

export type GoogleOAuthErrorCode =
  | 'email_missing'
  | 'email_not_verified'
  | 'google_unverified_email'
  | 'account_conflict'
  | 'google_id_missing'
  | 'email_mismatch'
  | 'oauth_failed'
  | 'state_mismatch'
  | 'not_configured';
