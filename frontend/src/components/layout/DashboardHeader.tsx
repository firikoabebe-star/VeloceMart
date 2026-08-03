"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/useAuth";

/* ── Theme Toggle (replicated from Navbar for dashboard use) ── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun icon */}
      <svg
        className={`absolute h-[22px] w-[22px] transition-all duration-300 ${
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
        className={`absolute h-[22px] w-[22px] transition-all duration-300 ${
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

/* ── Help Icon ────────────────────────────────────────────── */
function HelpButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        aria-haspopup="true"
        aria-expanded={showTooltip}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
        aria-label="Help & support"
      >
        <svg
          className="h-[22px] w-[22px]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
          />
        </svg>
      </button>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border/50 bg-surface shadow-elevation-3"
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-text-primary">
                Help & Support
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Need assistance? Check our FAQ or contact support.
              </p>
            </div>
            <div className="border-t border-border/30 px-4 py-2">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-accent-primary transition-colors hover:text-accent-primary/80"
                onClick={(e) => e.preventDefault()}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Visit Help Center
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Notification Bell ────────────────────────────────────── */
function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasPinged, setHasPinged] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = 3; // placeholder — wire to real data later

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Single ping on mount, stops after 2s
  useEffect(() => {
    if (!hasPinged) {
      const timer = setTimeout(() => setHasPinged(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasPinged]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        aria-haspopup="true"
        aria-expanded={showDropdown}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <svg
          className="h-[22px] w-[22px]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-[20px] items-center justify-center rounded-full bg-error px-1 text-[11px] font-bold leading-[15px] text-white ring-2 ring-surface">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {/* Single pulse ring on mount */}
        {!hasPinged && (
          <span className="absolute -right-1 -top-1 h-5 w-5 animate-ping rounded-full bg-error/40" />
        )}
      </button>
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border/50 bg-surface shadow-elevation-3"
          >
            <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
              <p className="text-sm font-semibold text-text-primary">
                Notifications
              </p>
              <span className="rounded-full bg-accent-tertiary/10 px-2 py-0.5 text-[10px] font-medium text-accent-primary">
                {unreadCount} new
              </span>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {[
                {
                  title: "Order shipped",
                  desc: "Your order #1234 has been shipped.",
                  time: "2 min ago",
                },
                {
                  title: "Price drop",
                  desc: "An item in your wishlist is now on sale.",
                  time: "1 hr ago",
                },
                {
                  title: "Payment received",
                  desc: "Payment for order #1230 confirmed.",
                  time: "3 hr ago",
                },
              ].map((notif, i) => (
                <button
                  key={i}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-tertiary"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-tertiary/10">
                    <svg
                      className="h-3.5 w-3.5 text-accent-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {notif.title}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted truncate">
                      {notif.desc}
                    </p>
                    <p className="mt-0.5 text-[10px] text-text-muted/60">
                      {notif.time}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-border/30 px-4 py-2">
              <button className="w-full rounded-lg py-1.5 text-center text-xs font-medium text-accent-primary transition-colors hover:bg-accent-tertiary/10">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── User Menu ──────────────────────────────────────────── */
function UserMenu() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "ADMIN";
  const onAdminPage = pathname.startsWith("/admin");
  const onAccountPage = pathname.startsWith("/account");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-tertiary text-xs font-semibold text-accent-primary">
          {user?.firstName?.[0]?.toUpperCase()}
        </div>
        <span className="hidden lg:inline">{user?.firstName}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
              <p className="mt-0.5 truncate text-xs text-text-muted">
                {user?.email}
              </p>
            </div>
            <div className="py-1">
              {onAdminPage && (
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  My Account
                </Link>
              )}
              {onAccountPage && isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                  onClick={() => setIsOpen(false)}
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

/* ── DashboardHeader ──────────────────────────────────────── */
interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/30 bg-surface px-6">
      <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-1">
        <HelpButton />
        <NotificationBell />
        <div className="mx-1.5 h-5 w-px bg-border/30" />
        <ThemeToggle />
        <div className="mx-1.5 h-5 w-px bg-border/30" />
        <UserMenu />
      </div>
    </header>
  );
}
