import { ApiError } from "@/lib/api";

/**
 * User-facing copy for the email verification flow.
 *
 * The API does not expose stable machine-readable error codes, so we map the
 * HTTP status (plus the small, intentional set of OTP messages the backend
 * emits) to safe strings here. Raw server text, status codes and stack traces
 * are never rendered.
 */
export const VERIFY_EMAIL_ERROR_MESSAGES = {
  incomplete: "Please enter the complete 6-digit verification code.",
  invalid: "Invalid verification code. Please check the code and try again.",
  expired: "This verification code has expired. Please request a new code.",
  used: "This verification code has already been used. Please request a new code.",
  alreadyVerified: "This email has already been verified. Please sign in.",
  network:
    "Unable to connect. Please check your internet connection and try again.",
  rateLimited: "Too many attempts. Please wait a moment before trying again.",
  generic: "Something went wrong. Please try again.",
} as const;

/**
 * Maps a failed `POST /auth/verify-email` call to a safe, friendly message.
 *
 * Only the known 400 variants from the auth service are matched by text; any
 * other 400 falls back to the generic "invalid code" copy so an unexpected
 * backend message can never leak to the user.
 */
export function getVerifyEmailErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return VERIFY_EMAIL_ERROR_MESSAGES.generic;
  }

  if (err.isNetworkError) return VERIFY_EMAIL_ERROR_MESSAGES.network;
  if (err.status === 429) return VERIFY_EMAIL_ERROR_MESSAGES.rateLimited;

  if (err.status === 400) {
    const message = err.message.toLowerCase();
    if (message.includes("expired")) {
      return VERIFY_EMAIL_ERROR_MESSAGES.expired;
    }
    if (message.includes("already been used")) {
      return VERIFY_EMAIL_ERROR_MESSAGES.used;
    }
    if (message.includes("already verified")) {
      return VERIFY_EMAIL_ERROR_MESSAGES.alreadyVerified;
    }
    if (message.includes("6-digit") || message.includes("code must")) {
      return VERIFY_EMAIL_ERROR_MESSAGES.incomplete;
    }
    return VERIFY_EMAIL_ERROR_MESSAGES.invalid;
  }

  return VERIFY_EMAIL_ERROR_MESSAGES.generic;
}

/**
 * Maps a failed `POST /auth/resend-otp` call to a safe message. This endpoint
 * returns a generic 200 response regardless of account state, so only
 * connectivity and throttling failures are expected here.
 */
export function getResendOtpErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return VERIFY_EMAIL_ERROR_MESSAGES.network;
    if (err.status === 429) return VERIFY_EMAIL_ERROR_MESSAGES.rateLimited;
  }
  return VERIFY_EMAIL_ERROR_MESSAGES.generic;
}

/* ── Password reset ──────────────────────────────────────── */

export const PASSWORD_RESET_ERROR_MESSAGES = {
  incomplete: "Please enter the complete 6-digit reset code.",
  invalid: "Invalid or expired reset code. Please check the code and try again.",
  expired: "This reset code has expired. Please request a new code.",
  used: "This reset code has already been used. Please request a new code.",
  network:
    "Unable to connect. Please check your internet connection and try again.",
  rateLimited: "Too many attempts. Please wait a moment before trying again.",
  request: "Something went wrong. Please try again.",
  reset: "Something went wrong. Please try again.",
} as const;

/**
 * Maps a failed `POST /auth/forgot-password` call to a safe message. The
 * endpoint responds generically for every account state, so only connectivity
 * and throttling failures should ever surface here.
 */
export function getForgotPasswordErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return PASSWORD_RESET_ERROR_MESSAGES.network;
    if (err.status === 429) return PASSWORD_RESET_ERROR_MESSAGES.rateLimited;
  }
  return PASSWORD_RESET_ERROR_MESSAGES.request;
}

/**
 * Maps a failed `POST /auth/reset-password` call to a safe, friendly message.
 *
 * As with email verification, the API has no stable error codes, so only the
 * known 400 variants are matched by text; any other 400 falls back to the
 * generic "invalid code" copy so raw backend detail can never leak.
 */
export function getResetPasswordErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return PASSWORD_RESET_ERROR_MESSAGES.reset;
  }

  if (err.isNetworkError) return PASSWORD_RESET_ERROR_MESSAGES.network;
  if (err.status === 429) return PASSWORD_RESET_ERROR_MESSAGES.rateLimited;

  if (err.status === 400) {
    const message = err.message.toLowerCase();
    if (message.includes("expired")) {
      return PASSWORD_RESET_ERROR_MESSAGES.expired;
    }
    if (message.includes("already been used")) {
      return PASSWORD_RESET_ERROR_MESSAGES.used;
    }
    if (message.includes("6-digit") || message.includes("code must")) {
      return PASSWORD_RESET_ERROR_MESSAGES.incomplete;
    }
    return PASSWORD_RESET_ERROR_MESSAGES.invalid;
  }

  return PASSWORD_RESET_ERROR_MESSAGES.reset;
}
