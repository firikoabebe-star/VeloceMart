import type { ContactCategory } from "@/lib/api";

export interface ContactFormValues {
  name: string;
  email: string;
  category: ContactCategory | "";
  subject: string;
  message: string;
  orderReference: string;
}

export type ContactFormErrors = Partial<
  Record<keyof ContactFormValues, string>
>;

export const MESSAGE_MIN_LENGTH = 10;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Client-side mirror of the server's contact DTO constraints. Kept intentionally
 * simple so the same rules can be unit tested and stay in sync with the backend
 * validation ("name >= 2, subject >= 3, message >= 10").
 */
export function validateContactForm(
  values: ContactFormValues,
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Please enter your name";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters";

  const email = values.email.trim();
  if (!email) errors.email = "Email is required";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Invalid email address";

  if (!values.category) errors.category = "Please choose a topic";

  const subject = values.subject.trim();
  if (!subject) errors.subject = "Subject is required";
  else if (subject.length < 3)
    errors.subject = "Subject must be at least 3 characters";

  const message = values.message.trim();
  if (!message) errors.message = "Message is required";
  else if (message.length < MESSAGE_MIN_LENGTH)
    errors.message = `Message must be at least ${MESSAGE_MIN_LENGTH} characters`;

  return errors;
}
