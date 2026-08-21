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
      
    </section>
  );
}
