"use client";

import AdminGuard from "@/features/admin/components/AdminGuard";
import AdminSidebar from "@/features/admin/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </AdminGuard>
  );
}
