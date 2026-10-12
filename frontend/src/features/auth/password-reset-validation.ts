/**
 * Pure validation for the password-reset form.
 *
 * Kept free of React and API imports so it can be exercised directly by the
 * Node test runner (no browser or bundler needed).
 */

export const OTP_LENGTH = 6;
export const MIN_PASSWORD_LENGTH = 8;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const INCOMPLETE_CODE_MESSAGE =
  "Please enter the complete 6-digit reset code.";

export function validateResetEmail(email: string): string | undefined {
  if (!email) return "Email is required";
  if (!EMAIL_PATTERN.test(email)) return "Invalid email address";
  return undefined;
}

export interface ResetFormValues {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export function validateResetForm(
  values: ResetFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (values.code.length !== OTP_LENGTH) {
    errors.code = INCOMPLETE_CODE_MESSAGE;
  }

  if (!values.newPassword) {
    errors.newPassword = "Password is required";
  } else if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = "Password must be at least 8 characters";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}
