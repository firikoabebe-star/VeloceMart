"use client";

import { useCallback, useState } from "react";
import AuthGuard from "@/features/auth/components/AuthGuard";
import AccountSidebar from "@/features/account/components/AccountSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
