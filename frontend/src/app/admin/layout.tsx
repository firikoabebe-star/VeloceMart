"use client";

import { useCallback, useState } from "react";
import AdminGuard from "@/features/admin/components/AdminGuard";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <AdminGuard>
      <div className="flex h-dvh bg-background">
        <AdminSidebar
          isDrawerOpen={isDrawerOpen}
          onCloseDrawer={closeDrawer}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader
            title="Admin Dashboard"
            onOpenDrawer={openDrawer}
          />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
