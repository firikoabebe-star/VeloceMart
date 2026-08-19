"use client";

import { motion } from "framer-motion";

/* ── Variants ─────────────────────────────────────────────── */

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

/* ── Trust data ───────────────────────────────────────────── */

const trustItems = [
  { label: "Free shipping", sub: "on orders over $100" },
  { label: "Easy returns", sub: "30-day return policy" },
  { label: "Secure checkout", sub: "SSL encrypted" },
];

/* ── TrustStrip ───────────────────────────────────────────── */

export default function TrustStrip() {
  return (
    <section className="border-y border-border/70 bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          {trustItems.map((trust) => (
            <motion.li
              key={trust.label}
              variants={item}
              className="flex items-center justify-center gap-3 sm:justify-start"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-primary/10">
                <svg
                  className="h-5 w-5 text-accent-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{trust.label}</p>
                <p className="text-xs text-text-muted">{trust.sub}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
