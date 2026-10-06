"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

/* ── AuthGuard ─────────────────────────────────────────────── */

/**
 * Client-side route protection.
 *
 * Auth cookies are set by the API on a different domain, so they are invisible
 * to `middleware.ts` (which runs on the edge and only sees cookies sent with the
 * incoming request). The session therefore has to be verified from the browser
 * against `/auth/me` instead.
 */
export default function AuthGuard({
  children,
  requireAdmin = false,
  loadingClassName = "flex h-dvh items-center justify-center bg-background",
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  loadingClassName?: string;
}) {
  const { isLoading, isAuthenticated, isAdmin, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) refreshUser();
  }, [isLoading, refreshUser]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (requireAdmin && !isAdmin) {
      router.replace("/account");
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin, pathname, router]);

  if (isLoading) {
    return (
      <div className={loadingClassName}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) return null;

  return <>{children}</>;
}
