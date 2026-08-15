"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/useAuth";

/* ── Types ────────────────────────────────────────────────── */
export interface DashboardNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  navItems: DashboardNavItem[];
  logoHref: string;
  badge?: string;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

/* ── Animation Variants ──────────────────────────────────── */
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants: Variants = {
  hidden: { x: "-100%" },
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
    x: "-100%",
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 350,
    },
  },
};

/* ── Component ────────────────────────────────────────────── */
export default function DashboardSidebar({
  navItems,
  logoHref,
  badge,
  isDrawerOpen,
  onCloseDrawer,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const baseHref = navItems[0]?.href;

  const isActive = (href: string) =>
    href === baseHref ? pathname === href : pathname.startsWith(href);

  /* Close the drawer whenever the route changes so the toggle
     state never lingers across navigations */
  useEffect(() => {
    onCloseDrawer();
  }, [pathname, onCloseDrawer]);

  /* Lock body scroll + Escape-to-close while the drawer is open */
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseDrawer();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isDrawerOpen, onCloseDrawer]);

  const renderContent = (onClose?: () => void) => (
    <>
      {/* Brand header */}
      <div className="flex h-16 shrink-0 items-center border-b border-border/30 px-4">
        <Link href={logoHref} onClick={onClose} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary">
            <span className="text-sm font-bold text-background">V</span>
          </div>
          <span className="text-lg font-bold text-text-primary">
            Veloce<span className="text-accent-primary">Mart</span>
          </span>
          {badge && (
            <span className="ml-1.5 rounded bg-accent-tertiary/20 px-2 py-0.5 text-[11px] font-semibold text-accent-primary">
              {badge}
            </span>
          )}
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-accent-tertiary/10 text-accent-primary"
                : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-border/30 bg-surface p-3">
        <div className="group relative rounded-xl px-3 py-3 transition-colors hover:bg-surface-tertiary">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-text-muted">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted opacity-60 transition-all duration-200 hover:bg-error/10 hover:text-error hover:opacity-100 group-hover:opacity-100"
              title="Sign out"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Persistent sidebar — lg and above */}
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-border/50 bg-surface lg:flex">
        {renderContent()}
      </aside>

      {/* Overlay drawer — md and below */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              key="dashboard-drawer-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.25 }}
              onClick={onCloseDrawer}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="dashboard-drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto border-r border-border/30 bg-surface shadow-elevation-3 lg:hidden"
            >
              {renderContent(onCloseDrawer)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
