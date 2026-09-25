"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCartStore } from "@/stores/cart-store";
import MobileDrawer from "./MobileDrawer";
import SearchOverlay from "@/components/search/SearchOverlay";
import {
  NAV_CATEGORIES,
  type MegaLink,
  type NavCategory,
} from "@/lib/navigation";

/* ── Theme Toggle ─────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun icon */}
      <svg
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>
      {/* Moon icon */}
      <svg
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark
            ? "-rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
      </svg>
    </button>
  );
}

/* ── Auth Button ─────────────────────────────────────────── */
function AuthButton() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="hidden h-9 w-20 animate-pulse rounded-lg bg-surface-tertiary sm:block" />
    );
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/auth/login"
        className="hidden rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent-primary/90 hover:shadow-glow-accent sm:inline-flex"
      >
        Sign In
      </a>
    );
  }

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-tertiary text-xs font-semibold text-accent-primary">
          {user?.firstName?.[0]?.toUpperCase()}
        </div>
        <span className="hidden md:inline">{user?.firstName}</span>
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-border/50 bg-surface shadow-elevation-3"
          >
            <div className="border-b border-border/30 px-4 py-3">
              <p className="text-sm font-medium text-text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                My Account
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function MegaMenu({
  category,
  onMouseEnter,
  onMouseLeave,
}: {
  category: NavCategory;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [flyout, setFlyout] = useState<
    { link: MegaLink; top: number; left: number } | null
  >(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const scheduleClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFlyout(null), 150);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const openSubmenu = useCallback((link: MegaLink, trigger: HTMLElement) => {
    const panel = panelRef.current;
    if (!panel) return;
    cancelClose();
    const pr = panel.getBoundingClientRect();
    const tr = trigger.getBoundingClientRect();
    const width = 224;
    const gap = 12;
    const opensLeft = pr.right - tr.right < width + gap;
    setFlyout({
      link,
      top: tr.top - pr.top,
      left: opensLeft ? tr.left - pr.left - width - gap : tr.right - pr.left + gap,
    });
  }, [cancelClose]);

  if (!category.megaColumns) return null;

  return (
    <motion.div
      key={category.label}
      ref={panelRef}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-1/2 top-full z-50 mt-0 w-screen max-w-4xl -translate-x-1/2"
    >
      <div className="mx-4 overflow-hidden rounded-xl border border-border/50 bg-surface/95 p-1 shadow-elevation-3 backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-px rounded-lg bg-border/20 p-1">
          {category.megaColumns.map((col) => (
            <div key={col.heading} className="rounded-lg bg-background/60 p-5">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                {col.heading}
              </h4>
              <ul className="space-y-1.5">
                {col.links.map((link) =>
                  link.children ? (
                    <li key={link.label}>
                      <button
                        type="button"
                        aria-expanded={flyout?.link.label === link.label}
                        aria-haspopup="true"
                        onMouseEnter={(e) => openSubmenu(link, e.currentTarget)}
                        onMouseLeave={scheduleClose}
                        onFocus={(e) => openSubmenu(link, e.currentTarget)}
                        onBlur={scheduleClose}
                        className="group inline-flex items-center gap-1 text-sm text-text-secondary transition-colors duration-150 hover:text-accent-strong"
                      >
                        {link.label}
                        <span
                          className={`inline-block text-accent-strong transition-all duration-150 ${
                            flyout?.link.label === link.label
                              ? "translate-x-0.5 opacity-100"
                              : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100"
                          }`}
                        >
                          →
                        </span>
                      </button>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-text-secondary transition-colors duration-150 hover:text-accent-strong"
                      >
                        {link.label}
                        <span className="inline-block text-accent-strong opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100">
                          →
                        </span>
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {flyout && (
          <motion.div
            key={flyout.link.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute z-50 w-56"
            style={{ top: flyout.top, left: flyout.left }}
          >
            <div className="overflow-hidden rounded-xl border border-border/50 bg-surface/95 p-1 shadow-elevation-3 backdrop-blur-xl">
              <div className="rounded-lg bg-background/60 p-4">
                <h5 className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                  {flyout.link.label}
                </h5>
                <ul className="space-y-1.5">
                  {flyout.link.children!.map((child) => (
                    <li key={child.label}>
                      <a
                        href={child.href}
                        className="group inline-flex items-center gap-1 text-sm text-text-secondary transition-colors duration-150 hover:text-accent-strong"
                      >
                        {child.label}
                        <span className="inline-block text-accent-strong opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100">
                          →
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavLink({
  category,
  isActive,
  onHover,
  onLeave,
}: {
  category: NavCategory;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const hasMega = !!category.megaColumns;

  if (!hasMega) {
    return (
      <a
        href={category.href}
        className="relative px-3 py-6 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-accent-strong"
      >
        {category.label}
      </a>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onLeave();
        }
      }}
    >
      <Link
        href={category.href}
        aria-expanded={isActive}
        aria-haspopup="true"
        className="group flex items-center gap-1 px-3 py-6 text-sm font-medium text-text-secondary"
      >
        <span className="underline decoration-transparent decoration-2 underline-offset-[6px] transition-all duration-200 ease-out group-hover:decoration-accent-strong">
          {category.label}
        </span>
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${
            isActive ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Link>
      <AnimatePresence>
        {isActive && (
          <MegaMenu
            category={category}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Navbar ──────────────────────────────────────────── */

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemCount = useCartStore((s) => s.itemCount);

  /* Scroll listener for glass effect */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Debounced hover helpers for mega menus */
  const openWithDelay = useCallback((label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  }, []);

  const closeWithDelay = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  /* Click-outside to close mega menu */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <header
        ref={navRef}
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "border-b border-border/30 bg-background/80 shadow-elevation-1 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text-primary lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary">
              <span className="text-sm font-bold text-on-accent">V</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              Veloce<span className="text-accent-strong">Mart</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            <a
              href="/"
              className="px-3 py-6 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-accent-strong"
            >
              Home
            </a>
            {NAV_CATEGORIES.map((cat) => (
              <NavLink
                key={cat.label}
                category={cat}
                isActive={activeMenu === cat.label}
                onHover={() => openWithDelay(cat.label)}
                onLeave={closeWithDelay}
              />
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart */}
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              aria-label="Cart"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-secondary text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Auth */}
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={NAV_CATEGORIES}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Spacer so content isn't hidden behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}
