"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import AccountSidebar from "@/features/account/components/AccountSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/account");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-dvh bg-background">
      <AccountSidebar
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={closeDrawer}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          title="My Account"
          onOpenDrawer={openDrawer}
        />
        <main className="flex-1 overflow-auto p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
