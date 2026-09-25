"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

/* ── Cloudinary media ─────────────────────────────────────── */
// Requested directly from Cloudinary — do not download or self-host.

const HERO_VIDEO_URL =
  "https://res.cloudinary.com/zx27qshh/video/upload/q_auto/f_auto/v1787211961/done.mp4";
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

const textContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const textItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const videoReveal = {
  hidden: { opacity: 0, scale: 0.97, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.2, ease: easeOut },
  },
};

const cardFloat1 = {
  hidden: { opacity: 0, y: -12, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay: 0.65, ease: easeOut },
  },
};

const cardFloat2 = {
  hidden: { opacity: 0, x: 12, scale: 0.92 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.55, delay: 0.85, ease: easeOut },
  },
};

const cardFloat3 = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay: 1.05, ease: easeOut },
  },
};

/* ── Category cards ─────────────────────────────────────── */

const HERO_CATEGORIES = [
  {
    label: "Men",
    href: "/category/men",
    image:
      "https://res.cloudinary.com/zx27qshh/image/upload/v1787564187/men.webp",
    shape: "rounded-2xl",
  },
  {
    label: "Women",
    href: "/category/women",
    image:
      "https://res.cloudinary.com/zx27qshh/image/upload/v1787562436/women.webp",
    shape: "rounded-3xl",
  },
  {
    label: "Kids",
    href: "/category/kids",
    image:
      "https://res.cloudinary.com/zx27qshh/image/upload/v1787562461/kids.jpg",
    shape: "rounded-xl",
  },
  {
    label: "Sale",
    href: "/sale",
    image:
      "https://res.cloudinary.com/zx27qshh/image/upload/v1787571664/sale.avif",
    shape: "rounded-2xl rounded-tr-[2rem]",
  },
];

/* ── HeroSection ──────────────────────────────────────────── */

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  const showVideo = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <section className="relative isolate w-full bg-background py-16 sm:py-20 lg:py-28">
      {/* Container matches header: max-w-7xl + same responsive padding */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Mobile / sm / md — stacked: text, then video ── */}
        <div className="flex flex-col gap-10 md:gap-14 lg:hidden">
          {/* Text */}
          <motion.div
            variants={textContainer}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div variants={textItem} className="mb-5 inline-flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-text-secondary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-primary" />
                </span>
                New Season — 2026
              </span>
            </motion.div>

            <motion.h1
              variants={textItem}
              className="text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl"
            >
              Style That
              <br />
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Moves With You
              </span>
            </motion.h1>

            <motion.p
              variants={textItem}
              className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg"
            >
              Premium fashion and accessories crafted for the modern lifestyle
              — from everyday essentials to statement pieces.
            </motion.p>

            <motion.div variants={textItem} className="mt-8">
              <a
                href="/collections/new"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-accent-primary px-7 py-3.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:shadow-glow-accent"
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
          </motion.div>

          {/* Video */}
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={videoReveal}
            className="w-full overflow-hidden rounded-2xl sm:rounded-3xl"
          >
            <div className="relative aspect-video">
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
            </div>
          </motion.div>

          {/* Category cards — mobile 2×2 */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: easeOut }}
            className="grid grid-cols-2 gap-4 sm:gap-5"
          >
            {HERO_CATEGORIES.map((cat) => (
              <a
                key={cat.label}
                href={cat.href}
                className={`group relative block overflow-hidden ${cat.shape}`}
              >
                <div className="relative aspect-[5/2] w-full overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/15 transition-colors duration-300 group-hover:bg-black/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute text-xl font-bold text-white/90 drop-shadow-md transition-opacity duration-300 group-hover:opacity-0">
                      {cat.label}
                    </span>
                    <span className="absolute inline-flex items-center gap-1 text-xl font-bold text-white drop-shadow-md opacity-0 transition-opacity duration-300 group-hover:opacity-90">
                      Go Shopping
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </motion.div>
        </div>

        {/* ── LG+ — split-screen: text left, video right ── */}
        <div className="hidden lg:block">
          <div className="flex items-start gap-10 xl:gap-14">
            {/* Left — text column */}
            <motion.div
              variants={textContainer}
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              className="flex-1 basis-[33%]"
            >
              <motion.div variants={textItem} className="mb-7 inline-flex">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-text-secondary">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-primary" />
                  </span>
                  New Season — 2026
                </span>
              </motion.div>

              <motion.h1
                variants={textItem}
                className="text-5xl font-bold leading-[1.08] tracking-tight text-text-primary xl:text-6xl 2xl:text-7xl"
              >
                Style That
                <br />
                <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                  Moves With You
                </span>
              </motion.h1>

              <motion.p
                variants={textItem}
                className="mt-7 max-w-lg text-lg leading-relaxed text-text-secondary xl:text-xl"
              >
                Premium fashion and accessories crafted for the modern lifestyle
                — from everyday essentials to statement pieces.
              </motion.p>

              <motion.div variants={textItem} className="mt-10">
                <a
                  href="/collections/new"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-accent-primary px-8 py-4 text-sm font-semibold text-on-accent transition-all duration-300 hover:shadow-glow-accent"
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
            </motion.div>

            {/* Right — video column */}
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              variants={videoReveal}
              className="relative flex-1 basis-[67%] self-stretch"
            >
              {/* Floating accent card — 50K+ customers */}
              <motion.div
                variants={cardFloat1}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                className="absolute -left-4 top-6 z-10 flex items-center gap-3 rounded-xl border border-border/60 bg-surface px-4 py-3 shadow-elevation-1 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary">
                  <svg
                    className="h-5 w-5 text-on-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight text-text-primary">50K+</p>
                  <p className="text-[11px] leading-tight text-text-muted">Happy Customers</p>
                </div>
              </motion.div>

              {/* Floating accent card — 4.9★ rating */}
              <motion.div
                variants={cardFloat2}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                className="absolute -right-4 bottom-16 z-10 flex items-center gap-3 rounded-xl border border-border/60 bg-surface px-4 py-3 shadow-elevation-1 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary">
                  <svg
                    className="h-5 w-5 text-on-accent"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-text-primary">4.9</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3 w-3 ${i < 4 ? "text-accent-strong" : "text-accent-strong/40"}`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] leading-tight text-text-muted">12k+ Reviews</p>
                </div>
              </motion.div>

              {/* Floating accent card — Free Shipping */}
              <motion.div
                variants={cardFloat3}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                className="absolute -left-4 bottom-28 z-10 flex items-center gap-3 rounded-xl border border-border/60 bg-surface px-4 py-3 shadow-elevation-1 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary">
                  <svg
                    className="h-5 w-5 text-on-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1 3h15v13H1z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8h4l3 3v5h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight text-text-primary">Free</p>
                  <p className="text-[11px] leading-tight text-text-muted">Express Shipping</p>
                </div>
              </motion.div>

              {/* Video — no card frame, sits flush against page background */}
              <div className="h-full overflow-hidden rounded-2xl xl:rounded-3xl">
                <div className="relative h-full">
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
                </div>
              </div>
            </motion.div>
          </div>

          {/* Category cards — full-width row below split screen */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: easeOut }}
            className="mt-16 grid grid-cols-2 gap-5 lg:grid-cols-4"
          >
            {HERO_CATEGORIES.map((cat) => (
              <a
                key={cat.label}
                href={cat.href}
                className={`group relative block overflow-hidden ${cat.shape}`}
              >
                <div className="relative aspect-[5/2] w-full overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/15 transition-colors duration-300 group-hover:bg-black/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute text-2xl font-bold text-white/90 drop-shadow-md transition-opacity duration-300 lg:text-3xl group-hover:opacity-0">
                      {cat.label}
                    </span>
                    <span className="absolute inline-flex items-center gap-1 text-2xl font-bold text-white drop-shadow-md opacity-0 transition-opacity duration-300 lg:text-3xl group-hover:opacity-90">
                      Go Shopping
                      <svg className="h-5 w-5 lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
