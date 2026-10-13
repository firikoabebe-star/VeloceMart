import type { GoogleOAuthErrorCode } from './google-oauth.constants.js';

// Internal, non-sensitive error used to carry a machine-readable reason from
// the Google verify callback to the callback guard. The code is safe to expose
// to the browser as a short `reason` query parameter; no email, Google payload
// or token is ever attached to it.
export class GoogleOAuthError extends Error {
  constructor(readonly code: GoogleOAuthErrorCode) {
    super(`Google OAuth failed: ${code}`);
    this.name = 'GoogleOAuthError';
  }
}
