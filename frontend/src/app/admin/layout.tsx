"use client";

import AdminGuard from "@/features/admin/components/AdminGuard";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader title="Admin Dashboard" />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
