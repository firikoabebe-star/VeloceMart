"use client";

import { motion } from "framer-motion";

/* ── Animation variants ───────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

/* ── HeroSection ──────────────────────────────────────────── */

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-accent-primary/5 blur-[120px] dark:bg-accent-primary/[0.04]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-secondary/5 blur-[100px] dark:bg-accent-secondary/[0.03]"
      />

      {/* Grid pattern overlay */}
      <div
        aria-hidden="true"
        className="hero-grid-overlay absolute inset-0 bg-[size:64px_64px]"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36"
      >
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div variants={item} className="mb-6 inline-flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-primary/20 bg-accent-primary/10 px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-accent-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-primary" />
              </span>
              New Season — 2026
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={item}
            className="text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Style That
            <br />
            <span className="bg-gradient-to-r from-accent-primary to-accent-primary/60 bg-clip-text text-transparent">
              Moves With You
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={item}
            className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            Discover premium fashion and accessories crafted for the modern
            lifestyle. From everyday essentials to statement pieces — redefine
            your wardrobe.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="/collections/new"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-accent-primary px-7 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:shadow-glow-accent"
            >
              <span className="relative z-10">Shop New Arrivals</span>
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
            <a
              href="/category/men"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface/50 px-7 py-3.5 text-sm font-medium text-text-primary backdrop-blur-sm transition-all duration-300 hover:border-accent-primary/40 hover:bg-accent-primary/5"
            >
              Explore Collections
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </a>
          </motion.div>

          {/* Trust markers */}
          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3"
          >
            {[
              { label: "Free shipping", sub: "on orders over $100" },
              { label: "Easy returns", sub: "30-day return policy" },
              { label: "Secure checkout", sub: "SSL encrypted" },
            ].map((trust) => (
              <div key={trust.label} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary/10">
                  <svg
                    className="h-4 w-4 text-accent-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{trust.label}</p>
                  <p className="text-xs text-text-muted">{trust.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
