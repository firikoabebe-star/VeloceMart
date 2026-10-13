import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional metadata row, e.g. a last-updated date. */
  meta?: ReactNode;
  /** Optional breadcrumb trail rendered above the title. */
  breadcrumbs?: Crumb[];
  /** Optional actions rendered below the description. */
  children?: ReactNode;
}

/**
 * Shared hero for informational pages (privacy, terms, help, contact, about).
 * Mirrors the storefront's type scale and container widths so the pages feel
 * like a natural extension of the shop.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  meta,
  breadcrumbs,
  children,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/30 bg-surface/40">
      <div
        aria-hidden="true"
        className="hero-grid-overlay pointer-events-none absolute inset-0 opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent-primary/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <div className="max-w-3xl">
          {eyebrow && (
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-text-secondary">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              {description}
            </p>
          )}
          {meta && <div className="mt-5">{meta}</div>}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}
