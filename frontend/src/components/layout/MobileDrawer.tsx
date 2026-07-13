"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

/* ── Types ────────────────────────────────────────────────── */
interface MegaColumn {
  heading: string;
  links: { label: string; href: string }[];
}

interface NavCategory {
  label: string;
  href: string;
  megaColumns?: MegaColumn[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: NavCategory[];
}

/* ── Animation Variants ──────────────────────────────────── */
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring" as const,
      damping: 28,
      stiffness: 300,
      mass: 0.9,
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 350,
    },
  },
};

const linkItemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.08 + i * 0.04,
      duration: 0.25,
      ease: "easeOut" as const,
    },
  }),
};

const subLinkVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.03,
      duration: 0.2,
      ease: "easeOut" as const,
    },
  }),
};

/* ── Component ────────────────────────────────────────────── */
export default function MobileDrawer({ isOpen, onClose, categories }: Props) {
  /* Lock body scroll when open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Close on Escape key */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKey);
    }
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const allCategories = [
    { label: "Home", href: "/" },
    ...categories,
    { label: "All Products", href: "/products" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="drawer-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            key="mobile-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-border/30 bg-background shadow-elevation-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary">
                  <span className="text-xs font-bold text-background">V</span>
                </div>
                <span className="text-base font-bold tracking-tight text-text-primary">
                  Veloce<span className="text-accent-primary">Mart</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="px-4 py-4">
              <ul className="space-y-1">
                {allCategories.map((cat, idx) => (
                  <motion.li
                    key={cat.label}
                    custom={idx}
                    variants={linkItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <a
                      href={cat.href}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-surface hover:text-accent-primary"
                    >
                      {cat.label}
                      {(cat as NavCategory).megaColumns && (
                        <svg
                          className="h-4 w-4 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      )}
                    </a>

                    {/* Sub-links for categories with mega menus */}
                    {(cat as NavCategory).megaColumns && (
                      <div className="mt-1 ml-4 space-y-0.5 border-l-2 border-border/30 pl-4">
                        {(cat as NavCategory).megaColumns!.map((col) => (
                          <div key={col.heading} className="py-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                              {col.heading}
                            </span>
                            <ul className="mt-1 space-y-0.5">
                              {col.links.map((link, li) => (
                                <motion.li
                                  key={link.label}
                                  custom={li}
                                  variants={subLinkVariants}
                                  initial="hidden"
                                  animate="visible"
                                >
                                  <a
                                    href={link.href}
                                    onClick={onClose}
                                    className="block rounded px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-accent-primary"
                                  >
                                    {link.label}
                                  </a>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Bottom CTA */}
            <div className="border-t border-border/20 px-5 py-5">
              <a
                href="/auth/login"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-lg bg-accent-primary px-4 py-3 text-sm font-semibold text-background transition-all duration-150 hover:bg-accent-primary/90 hover:shadow-glow-accent"
              >
                Sign In / Register
              </a>
              <p className="mt-3 text-center text-xs text-text-muted">
                Free shipping on orders over $100
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
