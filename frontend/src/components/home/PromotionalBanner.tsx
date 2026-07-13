"use client";

import { motion } from "framer-motion";

/* ── Variants ─────────────────────────────────────────────── */

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

/* ── Props ────────────────────────────────────────────────── */

interface PromoBannerProps {
  variant?: "accent" | "secondary";
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
}

/* ── PromotionalBanner ────────────────────────────────────── */
export default function PromotionalBanner({
  variant = "accent",
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: PromoBannerProps) {
  const isAccent = variant === "accent";

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={variants}
          className={`relative isolate overflow-hidden rounded-2xl ${
            isAccent
              ? "bg-gradient-to-br from-accent-primary/10 via-accent-secondary/5 to-accent-tertiary/10"
              : "bg-gradient-to-br from-accent-tertiary/10 via-accent-secondary/5 to-accent-primary/10"
          } border border-accent-primary/10 p-8 sm:p-12 lg:p-16`}
        >
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[80px] ${
              isAccent
                ? "bg-accent-primary/10"
                : "bg-accent-tertiary/10"
            }`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full blur-[60px] ${
              isAccent
                ? "bg-accent-secondary/10"
                : "bg-accent-primary/10"
            }`}
          />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>

            {/* CTA */}
            <a
              href={ctaHref}
              className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-lg bg-accent-primary px-7 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:shadow-glow-accent"
            >
              <span className="relative z-10">{ctaLabel}</span>
              <svg
                className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <div className="absolute inset-0 -translate-x-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
