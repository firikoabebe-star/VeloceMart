import Link from "next/link";
import type { ReactNode } from "react";

interface SupportCtaProps {
  title?: string;
  description?: string;
  /** Optional additional links rendered below the primary actions. */
  children?: ReactNode;
}

/**
 * Closing support call-to-action reused at the bottom of informational pages.
 * Always points at real routes (`/contact` and `/help`).
 */
export function SupportCta({
  title = "Still need help?",
  description = "Our support team can answer questions about your account, orders, or privacy.",
  children,
}: SupportCtaProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-surface p-6 shadow-elevation-1 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent-primary/90 hover:shadow-glow-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
          >
            Contact support
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-150 hover:border-accent-primary/60 hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
          >
            Visit Help Center
          </Link>
        </div>
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
