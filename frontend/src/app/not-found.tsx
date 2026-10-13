import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found — VeloceMart",
  description:
    "The page you are looking for does not exist or may have moved. Browse products, visit the Help Center, or head back home.",
};

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-text-secondary">
        404
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-text-secondary">
        The page you are looking for does not exist or may have moved. Try one
        of these instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent-primary/90 hover:shadow-glow-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
        >
          Back to home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-150 hover:border-accent-primary/60 hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
        >
          Browse products
        </Link>
        <Link
          href="/help"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-150 hover:border-accent-primary/60 hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
        >
          Help Center
        </Link>
      </div>
    </section>
  );
}
