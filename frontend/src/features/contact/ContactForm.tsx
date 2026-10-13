"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ApiError,
  getContactAvailability,
  submitContactMessage,
  type ContactCategory,
} from "@/lib/api";
import {
  validateContactForm,
  type ContactFormErrors,
  type ContactFormValues,
} from "./contact-validation";

const CATEGORY_OPTIONS: { value: ContactCategory; label: string }[] = [
  { value: "GENERAL", label: "General question" },
  { value: "ORDER", label: "Order or delivery" },
  { value: "PRODUCT", label: "Product question" },
  { value: "ACCOUNT", label: "Account or sign-in" },
  { value: "TECHNICAL", label: "Technical issue" },
  { value: "PRIVACY", label: "Privacy request" },
];

const INITIAL_VALUES: ContactFormValues = {
  name: "",
  email: "",
  category: "",
  subject: "",
  message: "",
  orderReference: "",
};

function getSubmitErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError)
      return "Unable to connect. Please check your internet connection and try again.";
    if (err.status === 429)
      return "You have sent several messages recently. Please wait a few minutes and try again.";
    if (err.status === 503)
      return "The contact form is temporarily unavailable. Please try again later or use the Help Center.";
    if (err.status === 400)
      return "Some details were not accepted. Please review the form and try again.";
  }
  return "Something went wrong and your message was not sent. Please try again.";
}

const fieldClass =
  "mt-1 block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-accent-primary";

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // null = still checking; true/false once the server reports availability.
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    getContactAvailability()
      .then((res) => {
        if (active) setAvailable(res.available);
      })
      .catch(() => {
        // If the status check fails, stay optimistic; the submit call is the
        // source of truth and will surface a clear error if delivery is off.
        if (active) setAvailable(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError("");
    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await submitContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        category: values.category as ContactCategory,
        subject: values.subject.trim(),
        message: values.message.trim(),
        orderReference: values.orderReference.trim() || undefined,
      });
      setSuccessMessage(res.message);
      setValues(INITIAL_VALUES);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) setAvailable(false);
      // Values are intentionally preserved so the user does not lose their text.
      setSubmitError(getSubmitErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-success/30 bg-success/10 p-6 sm:p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
          <svg
            className="h-6 w-6 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-text-primary">
          Message sent
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {successMessage}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-accent-primary/60 hover:text-accent-strong"
          >
            Send another message
          </button>
          <Link
            href="/help"
            className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-primary/90"
          >
            Browse the Help Center
          </Link>
        </div>
      </div>
    );
  }

  const isUnavailable = available === false;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {isUnavailable && (
        <div
          role="alert"
          className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-secondary"
        >
          <p className="font-semibold text-warning">Contact form unavailable</p>
          <p className="mt-1 leading-relaxed">
            Email delivery is not configured right now, so messages cannot be
            sent from this form. Please try again later, or explore the{" "}
            <Link href="/help" className="font-medium text-accent-strong hover:underline">
              Help Center
            </Link>{" "}
            for answers.
          </p>
        </div>
      )}

      {submitError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error"
        >
          {submitError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-text-primary">
            Full name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className={fieldClass}
            placeholder="Jane Doe"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-1 text-sm text-error">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-text-primary">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            className={fieldClass}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1 text-sm text-error">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-category" className="block text-sm font-medium text-text-primary">
          Topic
        </label>
        <select
          id="contact-category"
          name="category"
          value={values.category}
          onChange={(e) => update("category", e.target.value as ContactCategory | "")}
          className={fieldClass}
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "contact-category-error" : undefined}
        >
          <option value="">Choose a topic…</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p id="contact-category-error" className="mt-1 text-sm text-error">
            {errors.category}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-text-primary">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={values.subject}
          onChange={(e) => update("subject", e.target.value)}
          className={fieldClass}
          placeholder="A short summary of your question"
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
        />
        {errors.subject && (
          <p id="contact-subject-error" className="mt-1 text-sm text-error">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-order" className="block text-sm font-medium text-text-primary">
          Order reference <span className="font-normal text-text-muted">(optional)</span>
        </label>
        <input
          id="contact-order"
          name="orderReference"
          type="text"
          value={values.orderReference}
          onChange={(e) => update("orderReference", e.target.value)}
          className={fieldClass}
          placeholder="e.g. the order number from Order History"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-text-primary">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${fieldClass} resize-y`}
          placeholder="Tell us how we can help, with as much detail as you can."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1 text-sm text-error">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isUnavailable}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-5 py-3 text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent-primary/90 hover:shadow-glow-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-on-accent/40 border-t-on-accent"
            aria-hidden="true"
          />
        )}
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
