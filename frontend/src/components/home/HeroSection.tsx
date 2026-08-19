"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

/* ── Cloudinary media ─────────────────────────────────────── */
// Requested directly from Cloudinary — do not download or self-host.

const HERO_VIDEO_URL =
  "https://res.cloudinary.com/zx27qshh/video/upload/q_auto/f_auto/hero-boomerang-12s.mp4";
const HERO_POSTER_URL =
  "https://res.cloudinary.com/zx27qshh/image/upload/v1787038295/gotit.webp";

/* ── Connection helpers ───────────────────────────────────── */

interface ConnectionInfo {
  effectiveType?: string;
  saveData?: boolean;
}

type NavigatorWithConnection = Navigator & {
  connection?: ConnectionInfo;
};

function getConnection(): ConnectionInfo | undefined {
  return (navigator as NavigatorWithConnection).connection;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ── Video eligibility ────────────────────────────────────── */
// Poster-only unless the connection is fast and motion is not reduced.
// Computed once, then cached so repeated getSnapshot calls stay stable.

let cachedShowVideo: boolean | null = null;

function computeShowVideo(): boolean {
  if (typeof window === "undefined") return false;

  // Respect prefers-reduced-motion first — static poster only.
  if (prefersReducedMotion()) return false;

  // Respect data-saver / slow connections — never request the video.
  const connection = getConnection();
  if (connection?.saveData) return false;

  const effectiveType = connection?.effectiveType;
  if (effectiveType === "slow-2g" || effectiveType === "2g") return false;

  // Fast connection (3g/4g+, or no Network Information API available) → video.
  return true;
}

function getSnapshot(): boolean {
  if (cachedShowVideo === null) {
    cachedShowVideo = computeShowVideo();
  }
  return cachedShowVideo;
}

// Server renders the conservative default (poster only); the client upgrades
// to video after hydration without a hydration mismatch.
function getServerSnapshot(): boolean {
  return false;
}

function subscribe(): () => void {
  return () => {};
}

/* ── Animation variants ───────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
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
  const reduceMotion = useReducedMotion();
  const showVideo = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <section className="relative isolate h-[85vh] min-h-[560px] w-full overflow-hidden bg-background">
      {/* Backdrop treatment around the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-accent-primary/5 blur-[120px] dark:bg-accent-primary/[0.04]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-secondary/5 blur-[100px] dark:bg-accent-secondary/[0.03]"
      />

      {/* Contained media card — ~90% of the hero, centered */}
      <div className="absolute inset-[5%] overflow-hidden rounded-2xl bg-surface shadow-elevation-3 ring-1 ring-border/70 sm:rounded-3xl">
        {/* Media layer — poster shows instantly, video upgrades in place */}
        {showVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_POSTER_URL}
            preload="metadata"
            aria-hidden="true"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
        ) : (
          <img
            src={HERO_POSTER_URL}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Content — legibility chip behind the text instead of a full scrim */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
            <motion.div
              variants={container}
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              className="max-w-xl"
            >
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md sm:p-8">
                {/* Eyebrow */}
                <motion.div variants={item} className="mb-6 inline-flex">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    </span>
                    New Season — 2026
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  variants={item}
                  className="text-4xl font-bold leading-[1.1] tracking-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.4)] sm:text-5xl md:text-6xl lg:text-7xl"
                >
                  Style That
                  <br />
                  <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                    Moves With You
                  </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                  variants={item}
                  className="mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg"
                >
                  Premium fashion and accessories crafted for the modern
                  lifestyle — from everyday essentials to statement pieces.
                </motion.p>

                {/* Primary CTA */}
                <motion.div variants={item} className="mt-8">
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
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
